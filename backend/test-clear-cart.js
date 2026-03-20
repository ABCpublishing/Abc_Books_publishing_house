require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        await sql`DELETE FROM cart WHERE book_id = 112`;
        console.log('Successfully deleted book 112 from carts!');
        const remaining = await sql`SELECT * FROM cart`;
        console.log('Remaining cart items:', remaining);
    } catch (e) {
        console.error(e);
    }
}
main();
