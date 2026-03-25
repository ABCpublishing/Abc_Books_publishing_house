const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { neon } = require('@neondatabase/serverless');

async function resetAdmins() {
    console.log('🔄 Connecting to Neon database for Admin Reset...');
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('❌ Error: DATABASE_URL missing in .env');
        process.exit(1);
    }

    try {
        const sql = neon(url);

        // 1. Remove admin status from EVERYONE
        console.log('⏳ Downgrading all current admins...');
        await sql`UPDATE users SET is_admin = FALSE WHERE is_admin = TRUE`;

        // 2. Promote the primary admin email
        const mainAdmin = 'admin@abcbooks.com';
        console.log(`⏳ Promoting ${mainAdmin} to Super Admin...`);
        
        const result = await sql`
            UPDATE users 
            SET is_admin = TRUE, is_verified = TRUE 
            WHERE email = ${mainAdmin} 
            RETURNING id, name, email
        `;

        if (result.length > 0) {
            console.log('✅ Success! Admin reset complete.');
            console.log(`👑 Current Super Admin: ${result[0].name} (${result[0].email})`);
        } else {
            console.log('⚠️  Warning: main admin email was not found in database.');
            console.log('💡 I will now create the admin user for you...');
            
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('admin123', 10);
            
            await sql`
                INSERT INTO users (name, email, password_hash, is_admin, is_verified)
                VALUES ('Super Admin', ${mainAdmin}, ${hash}, TRUE, TRUE)
            `;
            console.log(`✅ Admin user created successfully with password: admin123`);
        }

    } catch (error) {
        console.error('❌ Error during reset:', error.message);
        console.log('💡 Note: If you are offline, this fix will still work once you push to the live site!');
    }
}

resetAdmins();
