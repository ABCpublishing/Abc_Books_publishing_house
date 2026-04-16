const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function testPgConnection() {
    console.log('🔄 Testing Neon database connection via TCP (pg) with full logs...');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing in .env');
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]);
        const client = await pool.connect();
        console.log('✅ TCP Connection successful!');
        
        const res = await client.query('SELECT NOW()');
        console.log('📅 Server time:', res.rows[0].now);
        
        client.release();
        await pool.end();
        console.log('🎉 Test finished successfully!');
    } catch (err) {
        console.error('❌ TCP Connection failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testPgConnection();
