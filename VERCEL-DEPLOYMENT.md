# 🚀 ABC Books - Vercel Deployment Guide

## Prerequisites
- Vercel CLI installed ✅
- Git installed
- Vercel account (sign up at vercel.com)

## Step 1: Initialize Git (if not already done)
```bash
cd "c:\Users\Danish\Desktop\ABC Books"
git init
git add .
git commit -m "Initial commit - ABC Books"
```

## Step 2: Login to Vercel
```bash
vercel login
```
This will open a browser - login with your Vercel account.

## Step 3: Deploy to Vercel
```bash
vercel
```
Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **abc-books** (or any name you prefer)
- Directory? **./** (current directory)

## Step 4: Set Environment Variables
After initial deployment, set your secrets in Vercel:

```bash
vercel env add DATABASE_URL
# Paste your Neon database URL when prompted

vercel env add JWT_SECRET
# Enter: abc123secretkey456

vercel env add RAZORPAY_KEY_ID
# Paste your Razorpay Key ID

vercel env add RAZORPAY_KEY_SECRET
# Paste your Razorpay Key Secret
```

## Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## Your Website URLs
After deployment, you'll get:
- **Preview URL**: https://abc-books-xxx-yourname.vercel.app
- **Production URL**: https://abc-books.vercel.app (after custom domain setup)

## Environment Variables Reference
| Variable | Description |
|----------|-------------|
| DATABASE_URL | Neon PostgreSQL connection string |
| JWT_SECRET | Secret key for JWT tokens |
| RAZORPAY_KEY_ID | Razorpay API Key ID |
| RAZORPAY_KEY_SECRET | Razorpay API Secret |

## Troubleshooting

### CORS Issues
The backend is configured to allow all Vercel domains. If you face CORS issues, check the server.js CORS configuration.

### Database Connection
Make sure your Neon database allows connections from Vercel's IP addresses (it should by default).

### API Not Working
Check the browser console for errors. The API URL should automatically switch between:
- **Development**: `http://localhost:3001/api`
- **Production**: `/api` (same domain)

## Files Modified for Vercel
- `vercel.json` - Deployment configuration
- `backend/server.js` - CORS for Vercel domains
- `js/services/api.js` - Dynamic API URL
- `js/pages/checkout.js` - Dynamic API URL
- `js/pages/book-detail.js` - Dynamic API URL
- `js/data/books-data.js` - Dynamic API URL
- `admin/admin.js` - Dynamic API URL
