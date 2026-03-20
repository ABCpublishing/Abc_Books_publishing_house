const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    let db;
    try {
        db = await mysql.createConnection(process.env.DATABASE_URL);
        
        console.log('--- Books ---');
        const [books] = await db.query('SELECT id, title FROM books');
        console.log(books);

        console.log('\n--- Book Sections ---');
        const [sections] = await db.query('SELECT * FROM book_sections');
        console.log(sections);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDb();
