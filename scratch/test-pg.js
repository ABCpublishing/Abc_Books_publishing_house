const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function testPgConnection() {
    console.log('🔄 Testing Neon database connection via TCP (pg)...');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const client = await pool.connect();
        console.log('✅ TCP Connection successful!');
        
        const res = await client.query('SELECT NOW()');
        console.log('📅 Server time:', res.rows[0].now);
        
        client.release();
        await pool.end();
        console.log('🎉 Test finished successfully!');
    } catch (err) {
        console.error('❌ TCP Connection failed:', err.message);
        process.exit(1);
    }
}

testPgConnection();
