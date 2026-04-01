const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function testMySQL() {
    console.log('--- MySQL Connectivity Test ---');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Present (Hidden)' : 'MISSING');

    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL missing in .env');
        return;
    }

    try {
        console.log('⏳ Connecting to MySQL...');
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        console.log('✅ Success! MySQL is connected correctly.');
        
        const [rows] = await connection.execute('SELECT DATABASE() as db_name');
        console.log('   Connected to database:', rows[0].db_name);
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('   Tables found:', tables.length);
        
        await connection.end();
    } catch (error) {
        console.error('❌ MySQL Error:', error.message);
        console.error('   Hint: Make sure your database server is running and credentials are correct.');
    }
}

testMySQL();
