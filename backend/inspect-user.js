require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        const users = await sql`SELECT id, name, email, is_admin FROM users WHERE id = 67`;
        console.log('User 67 info:', users);

        const cart = await sql`SELECT * FROM cart WHERE user_id = 67`;
        console.log('User 67 cart:', cart);
    } catch (e) {
        console.error(e);
    }
}
main();
