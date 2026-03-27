const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyUser() {
    try {
        const email = 'demouser@gmail.com';
        console.log(`🔍 Checking status for ${email}...`);
        
        const users = await sql('SELECT id, email, is_verified FROM users WHERE email = $1', [email]);
        
        if (users.length === 0) {
            console.log('❌ User not found.');
            return;
        }
        
        const user = users[0];
        console.log(`Current Status: ${user.is_verified ? 'Verified ✅' : 'Unverified ❌'}`);
        
        if (!user.is_verified) {
            await sql('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
            console.log('✅ User has been successfully verified!');
        } else {
            console.log('ℹ️ User is already verified.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyUser();
