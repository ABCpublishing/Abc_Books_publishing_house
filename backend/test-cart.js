require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        const result = await sql`SELECT * FROM cart`;
        console.log('Cart Items:', result);
    } catch (e) {
        console.error(e);
    }
}
main();
