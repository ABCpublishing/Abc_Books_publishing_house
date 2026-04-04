const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function runDiagnostics() {
    console.log('--- ABC Books Project Diagnostic Scan ---\n');

    // 1. Check Environment Variables
    console.log('1. Checking Environment Variables:');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
    let envOk = true;
    for (const v of requiredVars) {
        if (process.env[v]) {
            console.log(`  ✅ ${v} is set.`);
        } else {
            console.log(`  ❌ ${v} is MISSING.`);
            envOk = false;
        }
    }

    // 2. Check Database Connectivity
    console.log('\n2. Checking Database Connectivity:');
    if (process.env.DATABASE_URL) {
        try {
            const sql = neon(process.env.DATABASE_URL);
            const result = await sql`SELECT NOW()`;
            console.log('  ✅ Successfully connected to Neon PostgreSQL Database.');
            console.log('  🕒 Database Time:', result[0].now);

            // Check tables
            const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
            console.log('  📊 Tables found:', tables.map(t => t.table_name).join(', '));
        } catch (error) {
            console.log('  ❌ Database connection failed:', error.message);
        }
    } else {
        console.log('  ⚠️ Skipping database check (DATABASE_URL missing).');
    }

    // 3. Check Important Files
    console.log('\n3. Checking Project Structure:');
    const fs = require('fs');
    const essentialFiles = [
        'index.html',
        'backend/server.js',
        'js/script.js',
        'css/styles.css'
    ];
    for (const file of essentialFiles) {
        const fullPath = path.join(__dirname, '..', file);
        if (fs.existsSync(fullPath)) {
            console.log(`  ✅ ${file} exists.`);
        } else {
            console.log(`  ❌ ${file} is MISSING.`);
        }
    }

    console.log('\n--- Scan Complete ---');
}

runDiagnostics().catch(err => {
    console.error('Diagnostic tool error:', err);
});
