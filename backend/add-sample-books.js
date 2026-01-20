// ===== Add Sample Books to Database =====
// Run this to populate the database with sample books

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sampleBooks = [
    {
        title: "The Sealed Nectar",
        author: "Safiur Rahman Mubarakpuri",
        price: 299,
        original_price: 399,
        image: "https://m.media-amazon.com/images/I/71qKQ5Z5ixL._SY466_.jpg",
        description: "Biography of Prophet Muhammad (PBUH)",
        category: "Islamic",
        isbn: "9789960899558",
        publish_year: 2002,
        rating: 4.9
    },
    {
        title: "In the Footsteps of the Prophet",
        author: "Tariq Ramadan",
        price: 350,
        original_price: 450,
        image: "https://m.media-amazon.com/images/I/71xvXzKzNzL._SY466_.jpg",
        description: "Lessons from the Life of Muhammad",
        category: "Islamic",
        isbn: "9780195308808",
        publish_year: 2007,
        rating: 4.7
    },
    {
        title: "The Quran",
        author: "Abdullah Yusuf Ali (Translation)",
        price: 199,
        original_price: 299,
        image: "https://m.media-amazon.com/images/I/71Z8dGnNZwL._SY466_.jpg",
        description: "English Translation with Commentary",
        category: "Islamic",
        isbn: "9781853267888",
        publish_year: 1934,
        rating: 5.0
    },
    {
        title: "Sahih Al-Bukhari",
        author: "Muhammad al-Bukhari",
        price: 599,
        original_price: 799,
        image: "https://m.media-amazon.com/images/I/71nKXDs0SQL._SY466_.jpg",
        description: "Collection of Authentic Hadith",
        category: "Islamic",
        isbn: "9789960717432",
        publish_year: 850,
        rating: 4.9
    },
    {
        title: "Don't Be Sad",
        author: "Aaidh ibn Abdullah al-Qarni",
        price: 250,
        original_price: 350,
        image: "https://m.media-amazon.com/images/I/71xKZvGz5eL._SY466_.jpg",
        description: "Islamic Guide to Happiness",
        category: "Islamic",
        isbn: "9789960850269",
        publish_year: 2003,
        rating: 4.8
    }
];

async function addSampleBooks() {
    console.log('🔄 Connecting to Neon database...\n');

    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('📚 Adding sample books...\n');

        for (const book of sampleBooks) {
            const result = await sql`
                INSERT INTO books (
                    title, author, price, original_price, image, 
                    description, category, isbn, publish_year, rating
                ) VALUES (
                    ${book.title}, ${book.author}, ${book.price}, 
                    ${book.original_price}, ${book.image}, ${book.description}, 
                    ${book.category}, ${book.isbn}, ${book.publish_year}, ${book.rating}
                )
                RETURNING id, title
            `;

            console.log(`✅ Added: ${result[0].title} (ID: ${result[0].id})`);
        }

        console.log('\n🎉 All sample books added successfully!');
        console.log(`\n📊 Total books added: ${sampleBooks.length}`);

        // Verify
        const count = await sql`SELECT COUNT(*) as total FROM books`;
        console.log(`📚 Total books in database: ${count[0].total}`);

    } catch (error) {
        console.error('❌ Error adding books:', error.message);
        process.exit(1);
    }
}

addSampleBooks();
