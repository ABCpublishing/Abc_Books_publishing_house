// ===== Wishlist Routes =====
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/security');

// Apply authentication to all wishlist routes
router.use(authenticate);

// Get user's wishlist
router.get('/', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token

        const wishlistItems = await db(`
            SELECT w.id, w.created_at,
                   b.id as book_id, b.title, b.author, b.price, b.original_price, b.image, b.rating
            FROM wishlist w
            INNER JOIN books b ON w.book_id = b.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
        `, [userId]);

        res.json({
            wishlist: wishlistItems,
            count: wishlistItems.length
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: 'Failed to get wishlist' });
    }
});

// Add to wishlist
router.post('/', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { book_id } = req.body;

        // Check if already in wishlist
        const existing = await db(
            'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
            [userId, book_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already in wishlist' });
        }

        await db(
            'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)',
            [userId, book_id]
        );

        res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove from wishlist by record ID
router.delete('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { id } = req.params;

        // Security Check: Ensure user owns this record
        const result = await db('DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        
        if (result.length === 0) {
            return res.status(403).json({ error: 'Access denied', message: 'Not authorized to remove this item' });
        }
        
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// Remove by book ID (helper for toggle buttons)
router.delete('/book/:bookId', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { bookId } = req.params;

        await db('DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// Check if book is in wishlist
router.get('/check/:bookId', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { bookId } = req.params;

        const result = await db(
            'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
            [userId, bookId]
        );

        res.json({ inWishlist: result.length > 0 });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ error: 'Failed to check wishlist' });
    }
});

module.exports = router;
