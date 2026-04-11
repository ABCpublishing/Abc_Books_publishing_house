// ===== Payment Routes (Razorpay Integration) =====
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay only when keys are present
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();

const hasRazorpayKeys = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET;
const razorpay = hasRazorpayKeys
    ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
    : null;

if (hasRazorpayKeys) {
    console.log('✅ Razorpay initialized with key:', RAZORPAY_KEY_ID.substring(0, 12) + '...');
} else {
    console.warn('⚠️ Razorpay NOT initialized - missing keys in .env');
}

// Create Razorpay Order
// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
    if (!razorpay) {
        console.error('❌ Razorpay not initialized - missing or invalid keys');
        return res.status(503).json({ success: false, error: 'Payment gateway not configured on server' });
    }
    try {
        const { amount, currency = 'INR', receipt, notes } = req.body;

        console.log('💳 Razorpay Order Request:', { amount, currency, receipt });

        // Validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount',
                details: `Amount provided: ${amount}`
            });
        }

        // Razorpay minimum amount is ₹1 (100 paise)
        if (parsedAmount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Amount too low',
                details: 'Minimum payment amount is ₹1'
            });
        }

        // Create order options
        const options = {
            amount: Math.round(parsedAmount * 100), // Razorpay expects amount in paise
            currency: currency,
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {}
        };

        console.log('📤 Sending to Razorpay:', options);

        // Create order with Razorpay
        const order = await razorpay.orders.create(options);

        console.log('✅ Razorpay order created:', order.id, '| Amount:', order.amount, 'paise');

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            key_id: RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('❌ Razorpay Order Creation Error:', error);
        
        // Parse Razorpay-specific error format
        let errorMessage = 'Razorpay order creation failed';
        let errorDetails = error.message || 'Unknown error';

        if (error.error && error.error.description) {
            errorMessage = error.error.description;
            errorDetails = error.error.code || error.error.reason || '';
        } else if (error.description) {
            errorMessage = error.description;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: errorDetails
        });
    }
});


// Verify Payment Signature (Frontend Callback after Razorpay modal success)
// POST /api/payment/verify
router.post('/verify', async (req, res) => {
    if (!hasRazorpayKeys) {
        return res.status(503).json({ success: false, error: 'Payment gateway not configured' });
    }
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        console.log('========================================');
        console.log('🔐 PAYMENT VERIFICATION REQUEST');
        console.log('========================================');
        console.log('Order ID:', razorpay_order_id);
        console.log('Payment ID:', razorpay_payment_id);
        console.log('Signature:', razorpay_signature ? razorpay_signature.substring(0, 20) + '...' : 'MISSING');
        console.log('========================================');

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment verification data',
                details: {
                    has_order_id: !!razorpay_order_id,
                    has_payment_id: !!razorpay_payment_id,
                    has_signature: !!razorpay_signature
                }
            });
        }

        // Generate expected signature for verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        // Verify signature
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            console.log('✅ Payment verified successfully!');
            console.log('💰 Payment ID:', razorpay_payment_id);

            res.json({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            });
        } else {
            console.log('❌ Payment verification failed - signature mismatch');
            console.log('Expected:', expectedSignature.substring(0, 20) + '...');
            console.log('Got:', razorpay_signature.substring(0, 20) + '...');
            res.status(400).json({
                success: false,
                error: 'Payment verification failed - signature mismatch'
            });
        }

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment verification error',
            details: error.message
        });
    }
});


// Webhook Verification (Critical for ensuring orders are processed even if browser is closed)
// POST /api/payment/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            console.log('⚠️ Webhook received without signature header');
            return res.status(400).json({ error: 'Missing signature' });
        }

        // Verify webhook signature
        const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(bodyString);
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            console.log('❌ Webhook signature mismatch');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        console.log('✅ Webhook verified. Event:', payload.event);

        // Handle different payment events
        switch (payload.event) {
            case 'payment.captured': {
                const payment = payload.payload.payment.entity;
                console.log(`💰 Payment captured: ${payment.id} | Amount: ₹${payment.amount / 100} | Order: ${payment.order_id}`);

                // Update order status in DB if we can find the order
                try {
                    const db = req.sql;
                    if (db) {
                        await db(
                            `UPDATE orders SET status = 'paid', payment_id = $1, updated_at = NOW() 
                             WHERE payment_id = $2 OR order_id LIKE '%' || $3`,
                            [payment.id, payment.order_id, payment.notes?.order_ref || '']
                        );
                        console.log('✅ Order status updated via webhook');
                    }
                } catch (dbErr) {
                    console.error('⚠️ Webhook DB update failed:', dbErr.message);
                }
                break;
            }

            case 'payment.failed': {
                const failedPayment = payload.payload.payment.entity;
                console.log(`❌ Payment failed: ${failedPayment.id} | Reason: ${failedPayment.error_description}`);
                break;
            }

            case 'order.paid': {
                const order = payload.payload.order.entity;
                console.log(`✅ Order paid: ${order.id} | Amount: ₹${order.amount / 100}`);
                break;
            }

            default:
                console.log(`ℹ️ Unhandled webhook event: ${payload.event}`);
        }

        // Always respond 200 so Razorpay doesn't retry
        res.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still respond 200 to prevent webhook retries
        res.status(200).json({ status: 'error', message: 'Processing failed but acknowledged' });
    }
});


// Get Payment Details
// GET /api/payment/:paymentId
router.get('/:paymentId', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ success: false, error: 'Payment gateway not configured' });
    }
    try {
        const { paymentId } = req.params;

        const payment = await razorpay.payments.fetch(paymentId);

        res.json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100, // Convert from paise to rupees
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                order_id: payment.order_id,
                created_at: payment.created_at
            }
        });

    } catch (error) {
        console.error('❌ Failed to fetch payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment details'
        });
    }
});

// Refund Payment (for admin use)
// POST /api/payment/refund
router.post('/refund', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ success: false, error: 'Payment gateway not configured' });
    }
    try {
        const { payment_id, amount, notes } = req.body;

        if (!payment_id) {
            return res.status(400).json({ success: false, error: 'Payment ID is required' });
        }

        console.log('💸 Processing refund for payment:', payment_id, amount ? `Amount: ₹${amount}` : '(Full refund)');

        const refund = await razorpay.payments.refund(payment_id, {
            amount: amount ? Math.round(amount * 100) : undefined, // Full refund if amount not specified
            notes: notes || {}
        });

        console.log('✅ Refund processed:', refund.id);

        res.json({
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                payment_id: refund.payment_id
            }
        });

    } catch (error) {
        console.error('❌ Refund failed:', error);
        res.status(500).json({
            success: false,
            error: 'Refund failed',
            details: error.description || error.message
        });
    }
});

module.exports = router;
