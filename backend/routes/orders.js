// ===== Orders Routes =====
const express = require('express');
const router = express.Router();

// Get all orders (admin)
router.get('/', async (req, res) => {
    try {
        const sql = req.sql;

        const orders = await sql`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;

        // Get order items for each order
        for (let order of orders) {
            order.items = await sql`
                SELECT oi.*, b.title, b.author, b.image
                FROM order_items oi
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = ${order.id}
            `;
        }

        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get user's orders
router.get('/my-orders', async (req, res) => {
    try {
        const sql = req.sql;
        const userId = req.userId; // From auth middleware

        const orders = await sql`
            SELECT * FROM orders 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        for (let order of orders) {
            order.items = await sql`
                SELECT oi.*, b.title, b.author, b.image
                FROM order_items oi
                LEFT JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = ${order.id}
            `;
        }

        res.json({ orders });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const sql = req.sql;
        const { id } = req.params;

        const orders = await sql`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ${id}
        `;

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        order.items = await sql`
            SELECT oi.*, b.title, b.author, b.image
            FROM order_items oi
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ${order.id}
        `;

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const sql = req.sql;
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
            payment_method
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
        const orderResult = await sql`
            INSERT INTO orders (
                order_id, user_id, subtotal, discount, total,
                shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
                shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_pincode,
                payment_method, status
            ) VALUES (
                ${orderId}, ${user_id || null}, ${subtotal || 0}, ${discount || 0}, ${total || 0},
                ${shipping_first_name || ''}, ${shipping_last_name || ''}, ${shipping_email || ''}, ${shipping_phone || ''},
                ${shipping_address1 || ''}, ${shipping_address2 || ''}, ${shipping_city || ''}, ${shipping_state || ''}, ${shipping_pincode || ''},
                ${payment_method || 'COD'}, 'confirmed'
            )
            RETURNING *
        `;

        const order = orderResult[0];
        console.log('✅ Order created:', order.order_id);

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
                await sql`
                    INSERT INTO order_items (order_id, book_id, quantity, price, book_title, book_author, book_image)
                    VALUES (${order.id}, ${bookId}, ${itemQty}, ${itemPrice}, ${itemTitle}, ${itemAuthor}, ${itemImage})
                `;
                console.log('✅ Added order item:', { bookId, title: itemTitle, itemQty, itemPrice });
            } catch (itemError) {
                console.log('⚠️ Error adding item, trying without book_id:', itemError.message);
                // Insert without foreign key if book doesn't exist
                try {
                    await sql`
                        INSERT INTO order_items (order_id, book_id, quantity, price, book_title, book_author, book_image)
                        VALUES (${order.id}, NULL, ${itemQty}, ${itemPrice}, ${itemTitle}, ${itemAuthor}, ${itemImage})
                    `;
                } catch (err2) {
                    console.log('⚠️ Fallback insert error:', err2.message);
                }
            }
        }

        // Clear user's cart if user is logged in
        if (user_id) {
            await sql`DELETE FROM cart WHERE user_id = ${user_id}`;
            console.log('✅ Cart cleared for user:', user_id);
        }

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

// Update order status (admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const sql = req.sql;
        const { id } = req.params;
        const { status } = req.body;

        const result = await sql`
            UPDATE orders SET status = ${status}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order: result[0], message: 'Order status updated' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Delete order (admin)
router.delete('/:id', async (req, res) => {
    try {
        const sql = req.sql;
        const { id } = req.params;

        await sql`DELETE FROM order_items WHERE order_id = ${id}`;
        const result = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id`;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;
