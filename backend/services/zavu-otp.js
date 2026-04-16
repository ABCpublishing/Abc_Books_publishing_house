require('dotenv').config();
const Zavu = require('@zavudev/sdk');

// Zavu SDK Initialization
// You can provide the API key explicitly here or let it pick up ZAVUDEV_API_KEY from environment variables.
const zavu = new Zavu({
    apiKey: process.env.ZAVU_API_KEY || 'zv_live_f45d07bd94b69285f2395107be8a2373fafbb152ca757602'
});

async function sendOTP(phoneNumber, code) {
    if (!phoneNumber) {
        throw new Error('Phone number is required');
    }

    // Format phone number to E.164 if missing '+' (simple check for India +91 if needed, assuming default)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
        // Assume +91 for Indian numbers if not specified
        if (formattedPhone.length === 10) {
            formattedPhone = '+91' + formattedPhone;
        } else {
            formattedPhone = '+' + formattedPhone;
        }
    }

    try {
        console.log(`Sending OTP to ${formattedPhone}...`);
        const message = await zavu.messages.send({
            to: formattedPhone,
            text: `Your ABC Books verification code is: ${code}. Valid for 10 minutes. Do not share this with anyone.`,
            channel: 'auto'
        });
        
        console.log(`✅ Message sent via Zavu! ID: ${message.id}`);
        return true;
    } catch (error) {
        console.error('❌ Zavu sending error:', error.message);
        throw error;
    }
}

// Helper to generate 6 digit code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
    sendOTP,
    generateOTP
};
