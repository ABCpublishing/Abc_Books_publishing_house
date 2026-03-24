const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log('--- Testing Neon DB Connection (Standard pg driver) ---');
    console.log('URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
    
    const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        console.log('Executing simple query...');
        const res = await pool.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

test();
