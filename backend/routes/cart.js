// ===== Cart Routes =====
const express = require('express');
const router = express.Router();

// Get user's cart
router.get('/:userId', async (req, res) => {
    try {
        const db = req.sql;
        const { userId } = req.params;

        const [cartItems] = await db.execute(`
            SELECT c.id, c.quantity, c.created_at,
                   b.id as book_id, b.title, b.author, b.price, b.original_price, b.image
            FROM cart c
            INNER JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ?
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
        const { user_id, book_id, quantity = 1 } = req.body;

        // Check if item already in cart
        const [existing] = await db.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?',
            [user_id, book_id]
        );

        if (existing.length > 0) {
            // Update quantity
            const newQuantity = existing[0].quantity + quantity;
            await db.execute('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
            res.json({ message: 'Cart updated', quantity: newQuantity });
        } else {
            // Add new item
            await db.execute(
                'INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)',
                [user_id, book_id, quantity]
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
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            await db.execute('DELETE FROM cart WHERE id = ?', [id]);
            res.json({ message: 'Item removed from cart' });
        } else {
            await db.execute('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id]);
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
        const { id } = req.params;

        await db.execute('DELETE FROM cart WHERE id = ?', [id]);
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Clear entire cart
router.delete('/clear/:userId', async (req, res) => {
    try {
        const db = req.sql;
        const { userId } = req.params;

        await db.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
