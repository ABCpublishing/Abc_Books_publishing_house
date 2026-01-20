# 💳 Razorpay Payment Integration - ABC Books

## ✅ Integration Complete!

Razorpay payment gateway has been successfully integrated into ABC Books.

---

## 🔧 Configuration

### Environment Variables (backend/.env)
```env
RAZORPAY_KEY_ID=rzp_live_S5eQBNWpVnmLfk
RAZORPAY_KEY_SECRET=iGXV5hco9W5xK0GLA3SKB1E9
```

> ⚠️ **Note**: These are LIVE keys. For testing, you should use TEST keys from your Razorpay dashboard.

---

## 📁 Files Modified/Created

### Backend
| File | Description |
|------|-------------|
| `backend/.env` | Added Razorpay credentials |
| `backend/package.json` | Added razorpay package |
| `backend/routes/payment.js` | **NEW** - Payment routes for order creation, verification, refunds |
| `backend/server.js` | Added payment routes |

### Frontend
| File | Description |
|------|-------------|
| `pages/checkout.html` | Added Razorpay payment option + SDK script |
| `js/pages/checkout.js` | Added Razorpay payment flow logic |

---

## 💳 Payment Flow

### 1. User Selects Razorpay
When user selects "Pay with Razorpay" and clicks "Place Order":

### 2. Create Razorpay Order (Backend)
```
POST /api/payment/create-order
Body: { amount, currency, receipt, notes }
Response: { success, order: { id, amount, currency }, key_id }
```

### 3. Open Razorpay Checkout (Frontend)
Razorpay's secure checkout modal opens with:
- Cards (Visa, Mastercard, Rupay)
- UPI (GPay, PhonePe, Paytm)
- Net Banking
- Wallets

### 4. Payment Verification (Backend)
```
POST /api/payment/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
Response: { success, message, payment_id, order_id }
```

### 5. Order Saved
After successful verification, order is saved to database with:
- `payment_method: 'razorpay'`
- `payment_id: 'pay_XXXXXXXX'`
- `status: 'paid'`

---

## 🧪 Testing

### Test Cards for Razorpay
If you switch to TEST mode (`rzp_test_...`), use these test cards:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | Success |
| 5104 0600 0000 0008 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Declined |

### Test UPI IDs
- `success@razorpay` - Always succeeds
- `failure@razorpay` - Always fails

---

## 🔐 Security Features

1. **Signature Verification**: Every payment is verified using HMAC SHA256
2. **Server-side Order Creation**: Orders are created on the backend, not frontend
3. **Secure API Keys**: Secret key is never exposed to frontend
4. **HTTPS**: Razorpay requires HTTPS for live payments (works on localhost for testing)

---

## 📊 Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/create-order` | POST | Create Razorpay order |
| `/api/payment/verify` | POST | Verify payment signature |
| `/api/payment/:paymentId` | GET | Get payment details |
| `/api/payment/refund` | POST | Process refund |

---

## 🚀 How to Test

1. **Start Backend**: 
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   python -m http.server 5000
   ```

3. **Open Website**: http://localhost:5000

4. **Test Payment**:
   - Add items to cart
   - Go to checkout
   - Fill shipping details
   - Select "Pay with Razorpay"
   - Click "Place Order"
   - Complete payment in Razorpay modal
   - Order will be saved with payment ID

---

## 📱 Razorpay Dashboard

View your transactions at:
- **Live**: https://dashboard.razorpay.com
- **Test**: https://dashboard.razorpay.com (toggle test mode)

---

## ⚠️ Production Checklist

Before going live:
- [ ] Use HTTPS for your website
- [ ] Enable webhook notifications for order updates
- [ ] Set up email notifications for successful payments
- [ ] Configure auto-capture settings in Razorpay dashboard
- [ ] Add your business logo to Razorpay dashboard for branded checkout

---

**Integration Date**: 2026-01-19
**Status**: ✅ COMPLETE
