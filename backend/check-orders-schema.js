require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkSchema() {
    console.log('🔄 Connecting to Neon database...');
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('📋 Checking columns for "orders" table...');
        const orderColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
        `;
        console.table(orderColumns);

        console.log('\n📋 Checking if "order_status_history" table exists...');
        const historyExists = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'order_status_history'
            )
        `;
        console.log('Exists:', historyExists[0].exists);

        if (historyExists[0].exists) {
            console.log('\n📋 Checking columns for "order_status_history" table...');
            const historyColumns = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'order_status_history'
            `;
            console.table(historyColumns);
        }

    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkSchema();
