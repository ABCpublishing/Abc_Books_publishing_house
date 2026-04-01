const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        console.log('🔄 Connecting to local MySQL server at localhost:3306...');
        const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306';
        const connection = await mysql.createConnection(dbUrl);

        
        console.log('📦 Creating database `abc_books`...');
        await connection.query('CREATE DATABASE IF NOT EXISTS abc_books;');
        
        console.log('✅ Database `abc_books` created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error connecting to MySQL:');
        console.error(error.message);
        console.error('\n🛠️ FIX: Please ensure your local MySQL server (or XAMPP) is running!');
        process.exit(1);
    }
}

createDatabase();
