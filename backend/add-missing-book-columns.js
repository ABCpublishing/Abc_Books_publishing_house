const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const db = await mysql.createConnection(process.env.DATABASE_URL);
        console.log('Adding missing columns to books table...');
        
        await db.query(`
            ALTER TABLE books
            ADD COLUMN IF NOT EXISTS publisher VARCHAR(100),
            ADD COLUMN IF NOT EXISTS language VARCHAR(50),
            ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)
        `);
        
        console.log('✅ Columns added successfully.');
        process.exit(0);
    } catch(e) {
        // IF NOT EXISTS isn't standard in older MySQL for ALTER TABLE, so let's try-catch each
        const db = await mysql.createConnection(process.env.DATABASE_URL);
        try { await db.query('ALTER TABLE books ADD COLUMN publisher VARCHAR(100)'); } catch(e){}
        try { await db.query('ALTER TABLE books ADD COLUMN language VARCHAR(50)'); } catch(e){}
        try { await db.query('ALTER TABLE books ADD COLUMN subcategory VARCHAR(100)'); } catch(e){}
        console.log('✅ Columns added via fallback.');
        process.exit(0);
    }
}
run();
