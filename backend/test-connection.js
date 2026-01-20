// Quick test to verify Neon database connection
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
    console.log('🔄 Testing Neon database connection...\n');

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Simple query to test connection
        const result = await sql`SELECT NOW() as current_time, version() as db_version`;

        console.log('✅ Database connection successful!');
        console.log('📅 Server time:', result[0].current_time);
        console.log('🗄️  Database version:', result[0].db_version.split(' ')[0], result[0].db_version.split(' ')[1]);

        // Check if tables exist
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        console.log('\n📊 Existing tables:');
        if (tables.length > 0) {
            tables.forEach(t => console.log('   ✅', t.table_name));
        } else {
            console.log('   ⚠️  No tables found - run "npm run setup-db" to create them');
        }

        console.log('\n🎉 Connection test complete!');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check your internet connection');
        console.error('   2. Verify DATABASE_URL in .env file');
        console.error('   3. Check Neon dashboard for database status');
        process.exit(1);
    }
}

testConnection();
