
const fetch = require('node-fetch');

async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100, // 100 INR
                currency: 'INR',
                receipt: 'test_receipt'
            })
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Test Error:', err);
    }
}

test();
