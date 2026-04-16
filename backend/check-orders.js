require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkOrders() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const orders = await sql('SELECT * FROM orders');
        console.log('Total orders in DB:', orders.length);
        if (orders.length > 0) {
            console.log('Last order:', orders[orders.length - 1]);
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

checkOrders();
