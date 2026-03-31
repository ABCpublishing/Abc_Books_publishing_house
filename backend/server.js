
// ===== ABC Books Backend Server =====
// Using Neon PostgreSQL Database with Enhanced Security

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

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
    requestLogger,
    authenticateAdmin
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== Security Middleware =====
// Apply security headers to all responses (including static files)
app.use(securityHeaders);

// Serve frontend: static files + index.html at root
const rootDir = path.join(__dirname, '..');

// Serve favicon.ico from favicon.svg with correct MIME type
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(rootDir, 'favicon.svg'));
});

// Explicitly handle MIME types for static assets that may fail on some environments
app.use((req, res, next) => {
    if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    } else if (req.url.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
    }
    next();
});

app.use(express.static(rootDir));
app.get('/', (req, res) => res.sendFile(path.join(rootDir, 'index.html')));

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
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'https://www.abcbooks.store',
            'https://abcbooks.store',
            'http://www.abcbooks.store',
            'http://abcbooks.store'
        ];

        // Allow any Vercel domain
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
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

// DATABASE CONNECTION (Neon PostgreSQL)
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// Make sql available to routes
app.use((req, res, next) => {
    req.sql = async (query, params) => {
        try {
            // The 'neon' constructor function handles (query, params) correctly
            const result = await sql(query, params);
            // HTTP driver returns rows directly
            return Array.isArray(result) ? result : (result.rows || []);
        } catch (error) {
            console.error('🌐 Database Query Error:', error.message);
            throw error;
        }
    };
    next();
});


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ABC Books API v2.0 (Neon PostgreSQL) is running!' });
});

// Diagnostic endpoint
app.get('/api/debug-db', async (req, res) => {
    try {
        const dbStatus = {
            hasUrl: !!process.env.DATABASE_URL,
            urlPrefix: (process.env.DATABASE_URL || '').substring(0, 15) + '...',
            timestamp: new Date().toISOString()
        };
        
        const startTime = Date.now();
        const result = await req.sql('SELECT 1 + 1 as test');
        const duration = Date.now() - startTime;
        
        res.json({
            status: 'success',
            diagnostics: dbStatus,
            queryResult: result,
            responseTimeMs: duration
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            error: err.message,
            stack: err.stack,
            hasUrl: !!process.env.DATABASE_URL
        });
    }
});



// Contact form endpoint
app.post('/api/contact', rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many contact messages sent. Please try again after an hour.'
}), express.json(), async (req, res) => {

    try {
        const EmailService = require('./services/email');
        const contactData = req.body;
        
        // Basic validation
        if (!contactData.name || !contactData.email || !contactData.message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await EmailService.sendContactNotification(contactData);
        
        res.json({ message: 'Thank you! Your message has been sent successfully.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
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

// --- Stats Endpoint (Efficient for Admin Dashboard) ---
app.get('/api/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = await req.sql('SELECT (SELECT COUNT(*) FROM books) as total_books, (SELECT COUNT(*) FROM users) as total_users, (SELECT COUNT(*) FROM orders) as total_orders, (SELECT COUNT(*) FROM wishlist) as total_wishlist');

        // Get section counts from junction table
        const sectionStats = await req.sql('SELECT section_name as section, COUNT(*) as count FROM book_sections GROUP BY section_name');

        res.json({
            status: 'ok',
            counts: {
                total_books: parseInt(stats[0].total_books) || 0,
                total_users: parseInt(stats[0].total_users) || 0,
                total_orders: parseInt(stats[0].total_orders) || 0,
                total_wishlist: parseInt(stats[0].total_wishlist) || 0
            },
            sections: sectionStats.reduce((acc, curr) => {
                acc[curr.section] = parseInt(curr.count);
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 ABC Books API running on http://localhost:${PORT}`);
    });
}

module.exports = app;
