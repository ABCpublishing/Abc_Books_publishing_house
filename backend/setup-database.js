// ===== Database Setup Script =====
// Run this once to create all tables in Neon

require('dotenv').config();
// ===== Database Setup Script =====
// Run this once to create all tables in Neon

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
    console.log('🔄 Connecting to Neon PostgreSQL database...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('📦 Creating tables if they don\'t exist...\n');

        // Users table
        console.log('Creating users table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                dob DATE,
                gender VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                verification_token VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                reset_password_token VARCHAR(255),
                reset_password_expires TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )

        `);
        console.log('✅ users table created');

        // Books table
        console.log('Creating books table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(100) NOT NULL,
                publisher VARCHAR(100) DEFAULT 'ABC Publishing',
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2),
                image TEXT,
                description TEXT,
                category VARCHAR(50) DEFAULT 'General',
                language VARCHAR(50) DEFAULT 'Urdu',
                subcategory VARCHAR(100),
                isbn VARCHAR(20),
                publish_year INTEGER,
                weight VARCHAR(50),
                dimensions VARCHAR(100),
                rating DECIMAL(2,1) DEFAULT 4.5,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

            )
        `);
        console.log('✅ books table created');

        // Book sections (hero, featured, trending, etc.)
        console.log('Creating book_sections table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS book_sections (
                id SERIAL PRIMARY KEY,
                book_id INTEGER,
                section_name VARCHAR(50) NOT NULL,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ book_sections table created');

        // Cart table
        console.log('Creating cart table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS cart (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                book_id INTEGER,
                quantity INTEGER DEFAULT 1,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);
        console.log('✅ cart table created');

        // Wishlist table
        console.log('Creating wishlist table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                book_id INTEGER,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            )
        `);
        console.log('✅ wishlist table created');

        // Orders table
        console.log('Creating orders table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER,
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
                payment_id VARCHAR(100),
                status VARCHAR(20) DEFAULT 'confirmed',
                tracking_id VARCHAR(100),
                courier_name VARCHAR(100),
                estimated_delivery_date DATE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ orders table created');

        // Order items table
        console.log('Creating order_items table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER,
                book_id INTEGER,
                quantity INTEGER DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                book_title VARCHAR(255),
                book_author VARCHAR(100),
                book_image TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        `);
        console.log('✅ order_items table created');

        // order_status_history table
        console.log('Creating order_status_history table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS order_status_history (
                id SERIAL PRIMARY KEY,
                order_id INTEGER,
                status VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ order_status_history table created');

        // Addresses table
        console.log('Creating addresses table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type VARCHAR(20) DEFAULT 'Home',
                is_default BOOLEAN DEFAULT FALSE,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                phone VARCHAR(20),
                address_line1 TEXT NOT NULL,
                address_line2 TEXT,
                city VARCHAR(50) NOT NULL,
                state VARCHAR(50) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                country VARCHAR(50) DEFAULT 'India',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ addresses table created');


        // Categories table
        console.log('Creating categories table...');
        await sql(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100),
                icon VARCHAR(50),
                type VARCHAR(20) DEFAULT 'strip',
                parent_id INTEGER,
                display_order INTEGER DEFAULT 0,
                visible BOOLEAN DEFAULT true,
                is_language BOOLEAN DEFAULT FALSE,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
        `);
        console.log('✅ categories table created');

        // Create indexes for better performance
        console.log('\nCreating indexes...');
        // Standard Postgres doesn't need "CREATE INDEX IF NOT EXISTS" if using version older than 9.5 but Neon is modern.
        try { await sql('CREATE INDEX idx_books_category ON books(category)'); } catch(e){}
        try { await sql('CREATE INDEX idx_books_title ON books(title)'); } catch(e){}
        try { await sql('CREATE INDEX idx_orders_user ON orders(user_id)'); } catch(e){}
        try { await sql('CREATE INDEX idx_orders_status ON orders(status)'); } catch(e){}
        try { await sql('CREATE INDEX idx_cart_user ON cart(user_id)'); } catch(e){}
        try { await sql('CREATE INDEX idx_wishlist_user ON wishlist(user_id)'); } catch(e){}
        console.log('✅ indexes created');

        console.log('\n🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

// Run setup
setupDatabase();
