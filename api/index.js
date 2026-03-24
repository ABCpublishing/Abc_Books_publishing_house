module.exports = (req, res) => {
    try {
        const app = require('../backend/server.js');
        return app(req, res);
    } catch (error) {
        return res.status(500).json({
            error: "INIT_CRASH",
            message: error.message,
            name: error.name,
            stack: error.stack
        });
    }
};
