
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkAdmins() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        console.log('Listing users...');
        const users = await sql`SELECT id, name, email, is_admin FROM users LIMIT 20`;
        console.table(users);

        const admins = users.filter(u => u.is_admin);
        console.log('Admins found:', admins.length);

        if (admins.length === 0 && users.length > 0) {
            console.log(`Promoting ${users[0].email} (ID: ${users[0].id}) to admin...`);
            await sql`UPDATE users SET is_admin = TRUE WHERE id = ${users[0].id}`;
            console.log('Done!');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkAdmins();
