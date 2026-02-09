// Check categories in database
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkCategories() {
    try {
        const categories = await sql`
            SELECT id, name, slug, is_language, display_order 
            FROM categories 
            WHERE is_language = true 
            ORDER BY display_order
        `;

        console.log('📚 Main Language Categories in Database:');
        console.log('=========================================');
        categories.forEach(cat => {
            console.log(`  ${cat.display_order}. ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
        });
        console.log('=========================================');
        console.log(`Total: ${categories.length} categories`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCategories();
