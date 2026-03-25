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
            books = await db(`
                SELECT b.*, STRING_AGG(bs.section_name, ',') as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                WHERE b.title ILIKE $1 
                   OR b.author ILIKE $2
                   OR b.description ILIKE $3
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT $4
            `, [pattern, pattern, pattern, parsedLimit]);
        } else if (category) {
            books = await db(`
                SELECT b.*, STRING_AGG(bs.section_name, ',') as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                WHERE LOWER(b.category) = LOWER($1)
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT $2
            `, [category, parsedLimit]);
        } else {
            books = await db(`
                SELECT b.*, STRING_AGG(bs.section_name, ',') as sections_str
                FROM books b
                LEFT JOIN book_sections bs ON b.id = bs.book_id
                GROUP BY b.id
                ORDER BY b.created_at DESC
                LIMIT $1
            `, [parsedLimit]);
        }

        books.forEach(b => {
            b.sections = b.sections_str ? b.sections_str.split(',') : [];
            delete b.sections_str;
        });

        if (books.length === 0) {
            // FALLBACK: If DB is empty or unreachable, return premium demo books
            console.log("⚠️  Serving demo books fallback");
            books = [
                {
                    id: 1, title: 'The Holy Quran', author: 'Divine Revelation', category: 'Islamic', 
                    price: 299, original_price: 499, image: 'https://m.media-amazon.com/images/I/71xKk7+9jPL._AC_UF1000,1000_QL80_.jpg',
                    description: 'The complete Holy Quran with English translation.'
                },
                {
                    id: 2, title: 'Modern India', author: 'Rajiv Ahir', category: 'General', 
                    price: 394, original_price: 649, image: 'https://m.media-amazon.com/images/I/71xvXzKzNzL._SY466_.jpg',
                    description: 'A brief history of modern India.'
                },
                {
                    id: 3, title: 'Environment (10th Edition)', author: 'IAS Academy', category: 'General', 
                    price: 599, original_price: 899, image: 'https://m.media-amazon.com/images/I/81V6hF8TPIL._AC_UF1000,1000_QL80_.jpg',
                    description: 'Comprehensive guide for environmental science.'
                }
            ];
        }

        res.json({ books });
    } catch (error) {
        console.error('Get books error:', error);
        // Serve Fallback even on error
        const fallbackBooks = [
            {
                id: 1, title: 'The Holy Quran', author: 'Divine Revelation', category: 'Islamic', 
                price: 299, original_price: 499, image: 'https://m.media-amazon.com/images/I/71xKk7+9jPL._AC_UF1000,1000_QL80_.jpg',
                description: 'The complete Holy Quran with English translation.'
            }
        ];
        res.json({ books: fallbackBooks, message: "Displaying demo books due to database connection issue." });
    }
});

// Get books by section (hero, featured, trending, etc.)
// IMPORTANT: This route MUST come BEFORE /:id to avoid being shadowed
router.get('/section/:section', async (req, res) => {
    try {
        const db = req.sql;
        const { section } = req.params;

        console.log(`📚 Fetching books for section: ${section}`);

        const books = await db(
            'SELECT b.* FROM books b INNER JOIN book_sections bs ON b.id = bs.book_id WHERE bs.section_name = $1 ORDER BY bs.display_order ASC',
            [section]
        );

        console.log(`✅ Found ${books.length} books in ${section} section`);
        res.json({ books });
    } catch (error) {
        console.error('Get section books error:', error);
        
        // Comprehensive Fallback for all sections (Hero, Featured, etc.)
        const demoBooks = [
            {
                id: 1, title: 'The Holy Quran', author: 'Divine Revelation', category: 'Islamic', 
                price: 299, original_price: 499, image: 'https://m.media-amazon.com/images/I/71xKk7+9jPL._AC_UF1000,1000_QL80_.jpg',
                description: 'The complete Holy Quran with English translation.'
            },
            {
                id: 2, title: 'Modern India', author: 'Rajiv Ahir', category: 'General', 
                price: 394, original_price: 649, image: 'https://m.media-amazon.com/images/I/71xvXzKzNzL._SY466_.jpg',
                description: 'A brief history of modern India.'
            },
            {
                id: 3, title: 'Environment (10th Edition)', author: 'IAS Academy', category: 'General', 
                price: 599, original_price: 899, image: 'https://m.media-amazon.com/images/I/81V6hF8TPIL._AC_UF1000,1000_QL80_.jpg',
                description: 'Comprehensive guide for environmental science.'
            }
        ];
        
        res.json({ 
            books: demoBooks, 
            message: "Displaying demo books due to database connection issue.",
            isDemo: true 
        });
    }
});

// Get book by ID
router.get('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        const books = await db(`
            SELECT b.*, STRING_AGG(bs.section_name, ',') as sections_str
            FROM books b
            LEFT JOIN book_sections bs ON b.id = bs.book_id
            WHERE b.id = $1
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

        const bookResults = await db(`
            INSERT INTO books (title, author, publisher, price, original_price, image, description, category, language, subcategory, rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            title, author, publisher || 'ABC Publishing', price, original_price || null, image || null, 
            description || '', category || language || 'General', language || 'Urdu', subcategory || '', rating || 4.5
        ]);

        const book = bookResults[0];

        // Add sections if provided
        if (sections && Array.isArray(sections) && sections.length > 0) {
            for (const section of sections) {
                await db('INSERT INTO book_sections (book_id, section_name) VALUES ($1, $2)', [book.id, section]);
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

        const updateResult = await db(`
            UPDATE books SET
                title = $1, author = $2, publisher = $3, price = $4, original_price = $5,
                image = $6, description = $7, category = $8, language = $9, subcategory = $10, rating = $11, updated_at = NOW()
            WHERE id = $12
            RETURNING *
        `, [
            title, author, publisher || 'ABC Publishing', price, original_price || null,
            image || null, description || '', category || language || 'General', language || 'Urdu', subcategory || '', rating || 4.5, id
        ]);

        if (updateResult.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = updateResult[0];

        // Update sections if provided
        if (sections && Array.isArray(sections)) {
            // Remove old sections
            await db('DELETE FROM book_sections WHERE book_id = $1', [id]);

            // Add new sections
            for (const section of sections) {
                await db('INSERT INTO book_sections (book_id, section_name) VALUES ($1, $2)', [book.id, section]);
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

        await db('DELETE FROM book_sections WHERE book_id = $1', [id]);
        
        const result = await db('DELETE FROM books WHERE id = $1 RETURNING id', [id]);

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
