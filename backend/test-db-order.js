require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function testOrder() {
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        console.log('Testing order insertion...');
        
        const orderId = 'TEST-' + Date.now();
        const subtotal = 100.00;
        const total = 100.00;
        
        const result = await sql(`
            INSERT INTO orders (
                order_id, subtotal, total,
                shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
                shipping_address1, shipping_city, shipping_state, shipping_pincode,
                payment_method, status
            ) VALUES (
                $1, $2, $3,
                'Test', 'User', 'test@example.com', '1234567890',
                'Test Address', 'Test City', 'Test State', '123456',
                'COD', 'confirmed'
            ) RETURNING id
        `, [orderId, subtotal, total]);
        
        console.log('Order created with ID:', result[0].id);
        
        // Try inserting order item
        await sql(`
            INSERT INTO order_items (order_id, quantity, price, book_title)
            VALUES ($1, 1, 100.00, 'Test Book')
        `, [result[0].id]);
        
        console.log('Order item created');
        
        // Clean up
        await sql('DELETE FROM order_items WHERE order_id = $1', [result[0].id]);
        await sql('DELETE FROM orders WHERE id = $1', [result[0].id]);
        console.log('Test complete and cleaned up.');
        
    } catch (err) {
        console.error('Error during test:', err);
    }
}

testOrder();
