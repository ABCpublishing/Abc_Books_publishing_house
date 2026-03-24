// ===== Cart Routes =====
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/security');

// Apply authentication to all cart routes
router.use(authenticate);

// Get user's cart
router.get('/', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token

        const cartItems = await db(`
            SELECT c.id, c.quantity, c.created_at,
                   b.id as book_id, b.title, b.author, b.price, b.original_price, b.image
            FROM cart c
            INNER JOIN books b ON c.book_id = b.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `, [userId]);

        const total = cartItems.reduce((sum, item) =>
            sum + (parseFloat(item.price) * item.quantity), 0);

        res.json({
            cart: cartItems,
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            total
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// Add to cart
router.post('/', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { book_id, quantity = 1 } = req.body;

        // Check if item already in cart
        const existing = await db(
            'SELECT id, quantity FROM cart WHERE user_id = $1 AND book_id = $2',
            [userId, book_id]
        );

        if (existing.length > 0) {
            // Update quantity
            const newQuantity = existing[0].quantity + quantity;
            await db('UPDATE cart SET quantity = $1 WHERE id = $2', [newQuantity, existing[0].id]);
            res.json({ message: 'Cart updated', quantity: newQuantity });
        } else {
            // Add new item
            await db(
                'INSERT INTO cart (user_id, book_id, quantity) VALUES ($1, $2, $3)',
                [userId, book_id, quantity]
            );
            res.status(201).json({ message: 'Added to cart' });
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// Update cart item quantity
router.put('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            // Include user_id in WHERE clause to prevent IDOR
            await db('DELETE FROM cart WHERE id = $1 AND user_id = $2', [id, userId]);
            res.json({ message: 'Item removed from cart' });
        } else {
            // Include user_id in WHERE clause to prevent IDOR
            const result = await db('UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING id', [quantity, id, userId]);
            
            if (result.length === 0) {
                return res.status(403).json({ error: 'Access denied', message: 'Not authorized to modify this item' });
            }
            
            res.json({ message: 'Cart updated' });
        }
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove from cart
router.delete('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token
        const { id } = req.params;

        // Include user_id in WHERE clause to prevent IDOR
        const result = await db('DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        
        if (result.length === 0) {
            return res.status(403).json({ error: 'Access denied', message: 'Not authorized to delete this item' });
        }
        
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Clear entire cart
router.delete('/actions/clear', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; // Securely get from token

        await db('DELETE FROM cart WHERE user_id = $1', [userId]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
