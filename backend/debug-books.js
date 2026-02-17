
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function debugBooks() {
    console.log('Testing books query...');
    try {
        const sql = neon(process.env.DATABASE_URL);

        console.log('Querying books table...');
        const books = await sql`SELECT * FROM books LIMIT 5`;
        console.log(`Found ${books.length} books.`);
        if (books.length > 0) {
            console.log('Sample book:', books[0]);
        }

        console.log('Querying book_sections table...');
        const sections = await sql`SELECT * FROM book_sections LIMIT 5`;
        console.log(`Found ${sections.length} sections.`);

        console.log('Testing the complex join query...');
        const joinQuery = await sql`
            SELECT b.*, 
                   COALESCE(array_agg(bs.section_name) FILTER (WHERE bs.section_name IS NOT NULL), '{}') as sections
            FROM books b
            LEFT JOIN book_sections bs ON b.id = bs.book_id
            GROUP BY b.id
            LIMIT 5
        `;
        console.log(`Join query returned ${joinQuery.length} results.`);
        if (joinQuery.length > 0) {
            console.log('Sample joined result:', joinQuery[0]);
        }


        console.log('Testing nested SQL composition...');
        const whereClause = sql`WHERE b.id > 0`;
        const nestedQuery = await sql`
            SELECT count(*) as count FROM books b ${whereClause}
        `;
        console.log(`Nested query returned count: ${nestedQuery[0].count}`);

    } catch (error) {
        console.error('Error fetching books:', error);
        console.error('Error stack:', error.stack);
    }
}

debugBooks();
