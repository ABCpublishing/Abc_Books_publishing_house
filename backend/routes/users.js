const express = require('express');
const { authenticate, authenticateAdmin } = require('../middleware/security');
const router = express.Router();

// Get current logged-in user's profile
router.get('/me', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;

        const users = await db(
            'SELECT id, name, email, phone, is_admin, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get user's order stats
        const orderStats = await db(
            'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_spent FROM orders WHERE user_id = $1',
            [userId]
        );
        user.stats = {
            total_orders: parseInt(orderStats[0].count),
            total_spent: parseFloat(orderStats[0].total_spent) || 0
        };

        res.json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Get all users (admin)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;

        const users = await db(
            'SELECT id, name, email, phone, is_admin, created_at, updated_at FROM users ORDER BY created_at DESC'
        );

        // Get order count for each user
        for (let user of users) {
            const orderCount = await db(
                'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_spent FROM orders WHERE user_id = $1',
                [user.id]
            );
            user.order_count = parseInt(orderCount[0].count);
            user.total_spent = parseFloat(orderCount[0].total_spent) || 0;
        }

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Get user by ID with order history (requires authentication)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const userId = req.userId;
        const isAdmin = req.isAdmin;

        // Security Check: Only the user themselves OR an admin can view the profile
        if (!isAdmin && parseInt(id) !== userId) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You are not authorized to view this profile. You can only view your own data.'
            });
        }

        // Validate ID is a number
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const users = await db(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get user's orders
        const orders = await db(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );
        user.orders = orders;

        // Get order items for each order
        for (let order of user.orders) {
            const items = await db(`
                SELECT oi.*, b.title, b.author, b.image
                FROM order_items oi
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = $1
            `, [order.id]);
            order.items = items;
        }

        // Calculate stats
        user.stats = {
            total_orders: user.orders.length,
            total_spent: user.orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
            total_books: user.orders.reduce((sum, o) => sum + o.items.length, 0)
        };

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Delete user (admin only - requires admin authentication)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        // Fetch user basic info to get name before delete
        const users = await db('SELECT id, name FROM users WHERE id = $1', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = users[0];

        // Delete user's cart and wishlist first
        await db('DELETE FROM cart WHERE user_id = $1', [id]);
        await db('DELETE FROM wishlist WHERE user_id = $1', [id]);

        // Delete user
        await db('DELETE FROM users WHERE id = $1', [id]);

        res.json({ message: `User ${user.name} deleted successfully` });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user role (admin)
router.patch('/:id/role', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const { is_admin } = req.body;

        const result = await db(
            'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_admin',
            [is_admin, id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result[0];

        res.json({
            success: true,
            message: `User ${user.name} updated to ${user.is_admin ? 'Admin' : 'Customer'}`,
            user: user
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

module.exports = router;
