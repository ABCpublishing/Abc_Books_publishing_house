const app = require('../backend/server.js');

// Vercel serverless function handler
module.exports = (req, res) => {
    // Basic logging to help debug in Vercel console
    console.log(`API Request: ${req.method} ${req.url}`);

    // Pass request to the Express app
    return app(req, res);
};
