// ===== Orders Routes =====
const express = require('express');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/security');
const EmailService = require('../services/email');

// Apply authentication to all order routes
router.use(authenticate);

// Get all orders (admin)
// MASTER OPTIMIZATION: One query for orders, one query for ALL items in those orders.
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;

        const orders = await db(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        if (orders.length === 0) return res.json({ orders: [] });

        // Get all items in one batched query
        const orderIds = orders.map(o => o.id);
        const allItems = await db(`
            SELECT oi.*, b.title, b.author, b.image
            FROM order_items oi
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ANY($1)
        `, [orderIds]);

        // Map items to orders
        orders.forEach(order => {
            order.items = allItems.filter(item => item.order_id === order.id);
        });

        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get user's orders
// MASTER OPTIMIZATION: Batched fetching
router.get('/my-orders', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId; 

        const orders = await db('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        if (orders.length === 0) return res.json({ orders: [] });

        const orderIds = orders.map(o => o.id);
        const allItems = await db(`
            SELECT oi.*, b.title, b.author, b.image
            FROM order_items oi
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ANY($1)
        `, [orderIds]);

        orders.forEach(order => {
            order.items = allItems.filter(item => item.order_id === order.id);
        });

        res.json({ orders });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const userId = req.userId;
        const isAdmin = req.isAdmin;

        const isNumeric = /^\d+$/.test(id);
        const orders = await db(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE ${isNumeric ? 'o.id = $1' : 'o.order_id = $1'}
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        // Security Check: Only admin or the specific user can view the order
        if (!isAdmin && order.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have permission to view this order'
            });
        }

        // Fetch order items
        const items = await db(`
            SELECT oi.*, b.title, b.author, b.image
            FROM order_items oi
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = $1
        `, [order.id]);
        order.items = items;

        // Fetch order status history
        const history = await db(
            'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC',
            [order.id]
        );
        order.history = history;

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;

        // Security check: Ensure user is verified before placing orders (Temporarily disabled for testing)
        /*
        if (userId) {
            const userStatus = await db('SELECT is_verified FROM users WHERE id = $1', [userId]);
            if (userStatus.length > 0 && !userStatus[0].is_verified) {
                return res.status(403).json({ 
                    error: 'Account not verified', 
                    message: 'Please verify your email address to place orders.' 
                });
            }
        }
        */

        const {
            user_id,

            items,
            subtotal,
            discount,
            total,
            shipping_first_name,
            shipping_last_name,
            shipping_email,
            shipping_phone,
            shipping_address1,
            shipping_address2,
            shipping_city,
            shipping_state,
            shipping_pincode,
            payment_method,
            payment_id
        } = req.body;

        console.log('\n========================================');
        console.log('📦 NEW ORDER REQUEST RECEIVED');
        console.log('========================================');
        console.log('User ID:', user_id);
        console.log('Items count:', Array.isArray(items) ? items.length : (typeof items === 'string' ? 'JSON string' : 'unknown'));
        console.log('Subtotal:', subtotal);
        console.log('Discount:', discount);
        console.log('Total:', total);
        console.log('Customer:', shipping_first_name, shipping_last_name);
        console.log('Email:', shipping_email);
        console.log('Payment:', payment_method);
        console.log('========================================\n');

        // Generate order ID
        const orderId = 'ABC-' + Date.now().toString(36).toUpperCase();

        // Create order
        const actualUserId = user_id || req.userId;
        const initialStatus = payment_method === 'razorpay' ? 'paid' : 'confirmed';

        const orderResult = await db(`
            INSERT INTO orders (
                order_id, user_id, subtotal, discount, total,
                shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
                shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_pincode,
                payment_method, payment_id, status
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12, $13, $14,
                $15, $16, $17
            ) RETURNING *
        `, [
            orderId, actualUserId || null, subtotal || 0, discount || 0, total || 0,
            shipping_first_name || '', shipping_last_name || '', shipping_email || '', shipping_phone || '',
            shipping_address1 || '', shipping_address2 || '', shipping_city || '', shipping_state || '', shipping_pincode || '',
            payment_method || 'COD', payment_id || null, initialStatus
        ]);

        const order = orderResult && orderResult[0];
        if (!order) {
            throw new Error('Database failed to return created order. It may have failed to save.');
        }
        console.log('✅ Order created:', order.order_id);

        // Record initial status in history
        await db(
            'INSERT INTO order_status_history (order_id, status, notes) VALUES ($1, $2, $3)',
            [order.id, initialStatus, 'Order placed successfully']
        );
        console.log('✅ Initial status history recorded');

        // Add order items - handle both integer book_id and string local IDs
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

        for (const item of parsedItems) {
            // Try to get book_id as integer, if not valid use NULL
            let bookId = null;
            if (typeof item.book_id === 'number') {
                bookId = item.book_id;
            } else if (typeof item.book_id === 'string' && !isNaN(parseInt(item.book_id))) {
                bookId = parseInt(item.book_id);
            }

            // Store item details
            const itemPrice = item.price || 0;
            const itemQty = item.quantity || 1;
            const itemTitle = item.title || item.book_title || 'Book';
            const itemAuthor = item.author || item.book_author || '';
            const itemImage = item.image || item.book_image || '';

            try {
                await db(
                    'INSERT INTO order_items (order_id, book_id, quantity, price, book_title, book_author, book_image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [order.id, bookId, itemQty, itemPrice, itemTitle, itemAuthor, itemImage]
                );
                console.log('✅ Added order item:', { bookId, title: itemTitle, itemQty, itemPrice });
            } catch (itemError) {
                console.log('⚠️ Error adding item, trying without book_id:', itemError.message);
                // Insert without foreign key if book doesn't exist
                try {
                    await db(
                        'INSERT INTO order_items (order_id, book_id, quantity, price, book_title, book_author, book_image) VALUES ($1, NULL, $2, $3, $4, $5, $6)',
                        [order.id, itemQty, itemPrice, itemTitle, itemAuthor, itemImage]
                    );
                } catch (err2) {
                    console.log('⚠️ Fallback insert error:', err2.message);
                }
            }
        }

        // Clear user's cart if user is logged in
        if (user_id) {
            await db('DELETE FROM cart WHERE user_id = $1', [user_id]);
            console.log('✅ Cart cleared for user:', user_id);
        }

        // 4. Send Order Confirmation Email (Async)
        EmailService.sendOrderConfirmationEmail({
            ...order,
            items: parsedItems
        }).catch(emailErr => console.error('📧 Background email error:', emailErr));

        // 5. Send Admin Notification Email (Async)
        EmailService.sendAdminOrderNotification({
            ...order,
            items: parsedItems
        }).catch(emailErr => console.error('📧 Admin notification email error:', emailErr));


        res.status(201).json({
            order: {
                ...order,
                items: parsedItems
            },
            message: 'Order placed successfully!'
        });
    } catch (error) {
        console.error('\n❌❌❌ ORDER CREATION ERROR ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        console.error('Stack trace:', error.stack);
        console.error('========================================\n');
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
});

// Update order status & tracking info (admin only)
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const {
            status,
            notes,
            tracking_id,
            courier_name,
            estimated_delivery_date
        } = req.body;

        // 1. Get existing order to verify ID
        const isNumeric = /^\d+$/.test(id);
        const orders = await db(`SELECT id, status FROM orders WHERE ${isNumeric ? 'id = $1' : 'order_id = $1'}`, [id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const order = orders[0];

        // 2. Update order table
        const updateResult = await db(`
            UPDATE orders SET 
                status = $1, tracking_id = $2, courier_name = $3,
                estimated_delivery_date = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [
            status || order.status, tracking_id || null, courier_name || null,
            estimated_delivery_date || null, order.id
        ]);

        // 3. Insert into history table (Audit Trail)
        if (status && status !== order.status) {
            await db(
                'INSERT INTO order_status_history (order_id, status, notes) VALUES ($1, $2, $3)',
                [order.id, status, notes || 'Status updated by administrator']
            );
        } else if (notes || tracking_id || courier_name) {
            // Log update even if status didn't change but tracking was added
            await db(
                'INSERT INTO order_status_history (order_id, status, notes) VALUES ($1, $2, $3)',
                [order.id, status || order.status, notes || 'Tracking information updated']
            );
        }

        res.json({
            success: true,
            order: updateResult[0],
            message: 'Order status and tracking information updated'
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status', details: error.message });
    }
});

// Delete order (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        // Resolve integer ID first if order_id (string) was provided
        const isNumeric = /^\d+$/.test(id);
        const orders = await db(`SELECT id FROM orders WHERE ${isNumeric ? 'id = $1' : 'order_id = $1'}`, [id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const internalId = orders[0].id;

        await db('DELETE FROM order_items WHERE order_id = $1', [internalId]);
        await db('DELETE FROM order_status_history WHERE order_id = $1', [internalId]);
        await db('DELETE FROM orders WHERE id = $1', [internalId]);

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;
