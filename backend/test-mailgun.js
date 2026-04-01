require('dotenv').config({ path: './.env' });
const formData = require('form-data');
const Mailgun = require('mailgun.js');

async function testMailgun() {
    console.log('--- Mailgun Connectivity Test ---');
    console.log('Domain:', process.env.MAILGUN_DOMAIN);
    console.log('API Key:', process.env.MAILGUN_API_KEY ? 'Present (Hidden)' : 'MISSING');

    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        console.error('❌ Error: MAILGUN_API_KEY or MAILGUN_DOMAIN missing in .env');
        return;
    }

    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
    });

    try {
        console.log('⏳ Sending test email...');
        const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `ABC Books Test <postmaster@${process.env.MAILGUN_DOMAIN}>`,
            to: ['danish.abcbooks@gmail.com'], // Using a likely user email based on project name
            subject: 'Mailgun Connectivity Test - ABC Books',
            text: 'If you are reading this, your Mailgun integration is working perfectly!',
            html: '<h1>Mailgun is Running!</h1><p>Your ABC Books email service is correctly configured and active.</p>'
        });
        console.log('✅ Success! Mailgun returned:', result);
    } catch (error) {
        console.error('❌ Mailgun Error:', error.details || error.message);
        if (error.status === 401) {
            console.error('   Hint: Your API key might be invalid.');
        } else if (error.status === 404) {
            console.error('   Hint: Your domain might be incorrect or in the wrong region (US/EU).');
        }
    }
}

testMailgun();
