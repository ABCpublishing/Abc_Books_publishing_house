// ===== Books Routes =====
const express = require('express');
const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
    try {
        const sql = req.sql;
        const { category, search, limit = 50 } = req.query;

        let books;
        if (search) {
            books = await sql`
                SELECT * FROM books 
                WHERE title ILIKE ${'%' + search + '%'} 
                   OR author ILIKE ${'%' + search + '%'}
                   OR description ILIKE ${'%' + search + '%'}
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        } else if (category) {
            books = await sql`
                SELECT * FROM books 
                WHERE category = ${category}
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        } else {
            books = await sql`
                SELECT * FROM books 
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        }

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
        const sql = req.sql;
        const { section } = req.params;

        console.log(`📚 Fetching books for section: ${section}`);

        const books = await sql`
            SELECT b.* FROM books b
            INNER JOIN book_sections bs ON b.id = bs.book_id
            WHERE bs.section_name = ${section}
            ORDER BY bs.display_order ASC
        `;

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
        const sql = req.sql;
        const { id } = req.params;

        const books = await sql`
            SELECT b.*, 
                   COALESCE(array_agg(bs.section_name) FILTER (WHERE bs.section_name IS NOT NULL), '{}') as sections
            FROM books b
            LEFT JOIN book_sections bs ON b.id = bs.book_id
            WHERE b.id = ${id}
            GROUP BY b.id
        `;

        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ book: books[0] });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Failed to get book' });
    }
});

// Add new book (admin only)
router.post('/', async (req, res) => {
    try {
        const sql = req.sql;
        const { title, author, price, original_price, image, description, category, rating, sections } = req.body;

        const result = await sql`
            INSERT INTO books (title, author, price, original_price, image, description, category, rating)
            VALUES (${title}, ${author}, ${price}, ${original_price || null}, ${image || null}, ${description || ''}, ${category || 'General'}, ${rating || 4.5})
            RETURNING *
        `;

        const book = result[0];

        // Add sections if provided
        if (sections && Array.isArray(sections) && sections.length > 0) {
            for (const section of sections) {
                await sql`
                    INSERT INTO book_sections (book_id, section_name) 
                    VALUES (${book.id}, ${section})
                `;
            }
        }

        res.status(201).json({ book, message: 'Book added successfully' });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Failed to add book', details: error.message });
    }
});

// Update book (admin only)
router.put('/:id', async (req, res) => {
    try {
        const sql = req.sql;
        const { id } = req.params;
        const { title, author, price, original_price, image, description, category, rating, sections } = req.body;

        const result = await sql`
            UPDATE books SET
                title = ${title},
                author = ${author},
                price = ${price},
                original_price = ${original_price || null},
                image = ${image || null},
                description = ${description || ''},
                category = ${category || 'General'},
                rating = ${rating || 4.5},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = result[0];

        // Update sections if provided
        if (sections && Array.isArray(sections)) {
            // Remove old sections
            await sql`DELETE FROM book_sections WHERE book_id = ${id}`;

            // Add new sections
            for (const section of sections) {
                await sql`
                    INSERT INTO book_sections (book_id, section_name) 
                    VALUES (${book.id}, ${section})
                `;
            }
        }

        res.json({ book, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Delete book (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const sql = req.sql;
        const { id } = req.params;

        await sql`DELETE FROM book_sections WHERE book_id = ${id}`;
        const result = await sql`DELETE FROM books WHERE id = ${id} RETURNING id`;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;
