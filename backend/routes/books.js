// ===== Books Routes =====
const express = require('express');
const { authenticateAdmin } = require('../middleware/security');
const router = express.Router();

// Get all books with sections
router.get('/', async (req, res) => {
    try {
        const db = req.sql;
        const { category, search, limit = 100 } = req.query;
        const parsedLimit = parseInt(limit) || 100;

        let books;

        if (search) {
            const pattern = '%' + search + '%';
            const [rows] = await db.execute(`
                SELECT b.*, GROUP_CONCAT(bs.section_name) as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                WHERE b.title LIKE ? 
                   OR b.author LIKE ?
                   OR b.description LIKE ?
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT ?
            `, [pattern, pattern, pattern, parsedLimit]);
            books = rows;
        } else if (category) {
            const [rows] = await db.execute(`
                SELECT b.*, GROUP_CONCAT(bs.section_name) as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                WHERE LOWER(b.category) = LOWER(?)
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT ?
            `, [category, parsedLimit]);
            books = rows;
        } else {
            const [rows] = await db.execute(`
                SELECT b.*, GROUP_CONCAT(bs.section_name) as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT ?
            `, [parsedLimit]);
            books = rows;
        }

        books.forEach(b => {
            b.sections = b.sections_str ? b.sections_str.split(',') : [];
            delete b.sections_str;
        });

        res.json({ books });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to get books' });
    }
});

// Get books by section (hero, featured, trending, etc.)
// IMPORTANT: This route MUST come BEFORE /:id to avoid being shadowed
router.get('/section/:section', async (req, res) => {
    try {
        const db = req.sql;
        const { section } = req.params;

        console.log(`📚 Fetching books for section: ${section}`);

        const [books] = await db.execute(
            'SELECT b.* FROM books b INNER JOIN book_sections bs ON b.id = bs.book_id WHERE bs.section_name = ? ORDER BY bs.display_order ASC',
            [section]
        );

        console.log(`✅ Found ${books.length} books in ${section} section`);
        res.json({ books });
    } catch (error) {
        console.error('Get section books error:', error);
        res.status(500).json({ error: 'Failed to get section books' });
    }
});

// Get book by ID
router.get('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        const [books] = await db.execute(`
            SELECT b.*, GROUP_CONCAT(bs.section_name) as sections_str
            FROM books b
            LEFT JOIN book_sections bs ON b.id = bs.book_id
            WHERE b.id = ?
            GROUP BY b.id
        `, [id]);

        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = books[0];
        book.sections = book.sections_str ? book.sections_str.split(',') : [];
        delete book.sections_str;

        res.json({ book });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Failed to get book' });
    }
});

// Add new book (admin only - requires admin authentication)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { title, author, publisher, price, original_price, image, description, category, language, subcategory, rating, sections } = req.body;

        const [insertResult] = await db.execute(`
            INSERT INTO books (title, author, publisher, price, original_price, image, description, category, language, subcategory, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, author, publisher || 'ABC Publishing', price, original_price || null, image || null, 
            description || '', category || language || 'General', language || 'Urdu', subcategory || '', rating || 4.5
        ]);

        const [bookResults] = await db.execute('SELECT * FROM books WHERE id = ?', [insertResult.insertId]);
        const book = bookResults[0];

        // Add sections if provided
        if (sections && Array.isArray(sections) && sections.length > 0) {
            for (const section of sections) {
                await db.execute('INSERT INTO book_sections (book_id, section_name) VALUES (?, ?)', [book.id, section]);
            }
        }

        res.status(201).json({ book, message: 'Book added successfully' });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Failed to add book', details: error.message });
    }
});

// Update book (admin only - requires admin authentication)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const { title, author, publisher, price, original_price, image, description, category, language, subcategory, rating, sections } = req.body;

        const [updateResult] = await db.execute(`
            UPDATE books SET
                title = ?, author = ?, publisher = ?, price = ?, original_price = ?,
                image = ?, description = ?, category = ?, language = ?, subcategory = ?, rating = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            title, author, publisher || 'ABC Publishing', price, original_price || null,
            image || null, description || '', category || language || 'General', language || 'Urdu', subcategory || '', rating || 4.5, id
        ]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const [bookResults] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        const book = bookResults[0];

        // Update sections if provided
        if (sections && Array.isArray(sections)) {
            // Remove old sections
            await db.execute('DELETE FROM book_sections WHERE book_id = ?', [id]);

            // Add new sections
            for (const section of sections) {
                await db.execute('INSERT INTO book_sections (book_id, section_name) VALUES (?, ?)', [book.id, section]);
            }
        }

        res.json({ book, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Delete book (admin only - requires admin authentication)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        await db.execute('DELETE FROM book_sections WHERE book_id = ?', [id]);
        
        const [result] = await db.execute('DELETE FROM books WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;
