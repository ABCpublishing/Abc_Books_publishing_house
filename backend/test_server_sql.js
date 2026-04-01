
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        console.log('Using URL:', process.env.DATABASE_URL);
        const sql = neon(process.env.DATABASE_URL);
        const res = await sql('SELECT 1 + 1 as res');
        console.log('Result:', res);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
