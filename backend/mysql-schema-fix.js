const mysql = require('mysql2/promise');
require('dotenv').config();

async function runFix() {
    let db;
    try {
        console.log('🔄 Connecting to MySQL database...');
        db = await mysql.createConnection(process.env.DATABASE_URL);

        // 1. Fix Books Table
        console.log('📦 Updating `books` table...');
        const bookColumns = [
            'ALTER TABLE books ADD COLUMN publisher VARCHAR(100)',
            'ALTER TABLE books ADD COLUMN language VARCHAR(50)',
            'ALTER TABLE books ADD COLUMN subcategory VARCHAR(100)'
        ];
        for (const col of bookColumns) {
            try { await db.query(col); } catch(e) {}
        }

        // 2. Fix Categories Table
        console.log('📦 Updating `categories` table...');
        const catColumns = [
            'ALTER TABLE categories ADD COLUMN slug VARCHAR(100)',
            'ALTER TABLE categories ADD COLUMN is_language BOOLEAN DEFAULT FALSE',
            'ALTER TABLE categories ADD COLUMN description TEXT'
        ];
        for (const col of catColumns) {
            try { await db.query(col); } catch(e) {}
        }

        // 3. Fix Orders Table
        console.log('📦 Updating `orders` table...');
        const orderColumns = [
            'ALTER TABLE orders ADD COLUMN tracking_id VARCHAR(100)',
            'ALTER TABLE orders ADD COLUMN courier_name VARCHAR(100)',
            'ALTER TABLE orders ADD COLUMN estimated_delivery_date DATE'
        ];
        for (const col of orderColumns) {
            try { await db.query(col); } catch(e) {}
        }

        // 4. Fix Order Items Table
        console.log('📦 Updating `order_items` table...');
        const itemColumns = [
            'ALTER TABLE order_items ADD COLUMN book_title VARCHAR(255)',
            'ALTER TABLE order_items ADD COLUMN book_author VARCHAR(100)',
            'ALTER TABLE order_items ADD COLUMN book_image TEXT'
        ];
        for (const col of itemColumns) {
            try { await db.query(col); } catch(e) {}
        }

        // 5. Create order_status_history
        console.log('📦 Creating `order_status_history` table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_status_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                status VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ All schema fixes applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema fix failed:', error.message);
        process.exit(1);
    } finally {
        if (db) await db.end();
    }
}

runFix();
