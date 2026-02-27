require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkAndSetAdmin() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const users = await sql`SELECT id, email, is_admin FROM users WHERE email = 'admin@abcbooks.com'`;
        console.table(users);

        if (users.length > 0) {
            await sql`UPDATE users SET is_admin = TRUE WHERE email = 'admin@abcbooks.com'`;
            console.log('Updated admin@abcbooks.com to be an admin.');
        } else {
            console.log('admin@abcbooks.com user not found. Creating one...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('admin123', 10);
            await sql`INSERT INTO users (name, email, password_hash, is_admin, is_verified) 
                      VALUES ('Super Admin', 'admin@abcbooks.com', ${hash}, TRUE, TRUE)`;
            console.log('Created admin@abcbooks.com as admin.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAndSetAdmin();
