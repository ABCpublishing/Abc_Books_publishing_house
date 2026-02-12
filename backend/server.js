
// ===== ABC Books Backend Server =====
// Using Neon PostgreSQL Database with Enhanced Security

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

// Import routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const paymentRoutes = require('./routes/payment');
const categoriesRoutes = require('./routes/categories');

// Import security middleware
const {
    securityHeaders,
    sanitizeInput,
    rateLimit,
    requestLogger
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== Security Middleware =====
// Apply security headers to all responses
app.use(securityHeaders);

// Request logging for monitoring
app.use(requestLogger);

// Rate limiting - 100 requests per 15 minutes per IP
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
}));

// Stricter rate limit for auth endpoints (prevent brute force)
app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    message: 'Too many login attempts. Please try again in 15 minutes.'
}));

// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://www.abcbooks.store',
            'https://abcbooks.store',
            'http://www.abcbooks.store',
            'http://abcbooks.store'
        ];

        // Allow any Vercel domain
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now - can be restricted later
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limit (prevent large payload attacks)
app.use(express.json({ limit: '10mb' }));

// Input sanitization for all requests
app.use(sanitizeInput);

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Make sql available to routes
app.use((req, res, next) => {
    req.sql = sql;
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ABC Books API v2.0 (Verified) is running!' });
});

// Root endpoint for friendly message
app.get('/', (req, res) => {
    res.send('Welcome to ABC Books Backend API! 🚀 Use /api/health to check status.');
});

// Maintenance Route - Fix DB Schema
app.get('/api/fix-db-schema', async (req, res) => {
    try {
        await req.sql`ALTER TABLE books ALTER COLUMN image TYPE TEXT`;
        await req.sql`ALTER TABLE books ALTER COLUMN description TYPE TEXT`;
        res.send('✅ Schema updated successfully! Columns "image" and "description" are now TEXT type.');
    } catch (error) {
        console.error('Schema update failed:', error);
        res.status(500).send('Schema update failed: ' + error.message);
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoriesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 ABC Books API running on http://localhost:${PORT}`);
        console.log(`📚 Database: Neon PostgreSQL`);
    });
}

module.exports = app;
