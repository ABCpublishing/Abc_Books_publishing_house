// ===== Database Setup Script =====
// Run this once to create all tables in Neon

require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
    console.log('🔄 Connecting to MySQL database...');

    const db = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('📦 Creating tables...\n');

        // Users table
        console.log('Creating users table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ users table created');

        // Books table
        console.log('Creating books table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2),
                image TEXT,
                description TEXT,
                category VARCHAR(50) DEFAULT 'General',
                isbn VARCHAR(20),
                publish_year INTEGER,
                rating DECIMAL(2,1) DEFAULT 4.5,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ books table created');

        // Book sections (hero, featured, trending, etc.)
        console.log('Creating book_sections table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS book_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                book_id INT,
                section_name VARCHAR(50) NOT NULL,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ book_sections table created');

        // Cart table
        console.log('Creating cart table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                book_id INT,
                quantity INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);
        console.log('✅ cart table created');

        // Wishlist table
        console.log('Creating wishlist table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                book_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);
        console.log('✅ wishlist table created');

        // Orders table
        console.log('Creating orders table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                user_id INT,
                subtotal DECIMAL(10,2) NOT NULL,
                discount DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                shipping_first_name VARCHAR(50),
                shipping_last_name VARCHAR(50),
                shipping_email VARCHAR(100),
                shipping_phone VARCHAR(20),
                shipping_address1 TEXT,
                shipping_address2 TEXT,
                shipping_city VARCHAR(50),
                shipping_state VARCHAR(50),
                shipping_pincode VARCHAR(10),
                payment_method VARCHAR(20) DEFAULT 'COD',
                status VARCHAR(20) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ orders table created');

        // Order items table
        console.log('Creating order_items table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                book_id INT,
                quantity INTEGER DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        `);
        console.log('✅ order_items table created');

        // Categories table
        console.log('Creating categories table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50),
                type VARCHAR(20) DEFAULT 'strip',
                parent_id INT,
                display_order INTEGER DEFAULT 0,
                visible BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
        `);
        console.log('✅ categories table created');

        // Create indexes for better performance
        console.log('\nCreating indexes...');
        await db.query('CREATE INDEX idx_books_category ON books(category)');
        await db.query('CREATE INDEX idx_books_title ON books(title)');
        await db.query('CREATE INDEX idx_orders_user ON orders(user_id)');
        await db.query('CREATE INDEX idx_orders_status ON orders(status)');
        await db.query('CREATE INDEX idx_cart_user ON cart(user_id)');
        await db.query('CREATE INDEX idx_wishlist_user ON wishlist(user_id)');
        console.log('✅ indexes created');

        console.log('\n🎉 Database setup complete!');
        console.log('\n📝 Tables created:');
        console.log('   - users');
        console.log('   - books');
        console.log('   - book_sections');
        console.log('   - cart');
        console.log('   - wishlist');
        console.log('   - orders');
        console.log('   - order_items');
        console.log('   - categories');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    } finally {
        if (db) await db.end();
    }
}

// Run setup
setupDatabase();
