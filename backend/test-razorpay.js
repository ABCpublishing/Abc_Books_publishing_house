const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Razorpay = require('razorpay');

async function testRazorpay() {
    console.log('--- Razorpay Connectivity Test ---');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present (Hidden)' : 'MISSING');
    console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present (Hidden)' : 'MISSING');

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env');
        return;
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    try {
        console.log('⏳ Fetching account info to test keys...');
        // We can't fetch account info with restricted keys, let's try to fetch a payment or some generic endpoint
        // Or just list recent orders
        const orders = await razorpay.orders.all({ count: 1 });
        console.log('✅ Success! Razorpay API is responding correctly.');
        console.log('   Recent orders found:', orders.items.length);
    } catch (error) {
        console.error('❌ Razorpay Error:', error.message);
        if (error.statusCode === 401) {
            console.error('   Hint: Your Key ID or Secret might be invalid/incorrect for the environment.');
        }
    }
}

testRazorpay();
