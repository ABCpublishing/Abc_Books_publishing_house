# 🚀 ABC Books Backend - Quick Start Guide

## ✅ **TL;DR - Just Run This:**

```bash
cd "c:\Users\Danish\Desktop\ABC Books\backend"
npm run dev
```

**That's it!** Your backend is now running on `http://localhost:3001` 🎉

---

## 📋 **What is the Backend?**

The backend is a **Node.js server** that:
- ✅ Connects to your **Neon PostgreSQL database**
- ✅ Handles user authentication (login/signup)
- ✅ Manages books, cart, wishlist, and orders
- ✅ Provides API endpoints for your frontend

---

## 🎯 **Step-by-Step: First Time Setup**

### **1. Make Sure You Have Everything**

Check if these are installed:
```bash
node --version    # Should show v16 or higher
npm --version     # Should show npm version
```

### **2. Navigate to Backend Folder**

```bash
cd "c:\Users\Danish\Desktop\ABC Books\backend"
```

### **3. Install Dependencies** (Only needed once)

```bash
npm install
```

### **4. Check Your Environment File**

Make sure `backend\.env` exists and has:
```env
DATABASE_URL=postgresql://neondb_owner:npg_XSMvG7AdQ9au@ep-tiny-heart-a1qe1imw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=abc-books-secret-key-2026-production
PORT=3001
```

✅ **You already have this configured!**

### **5. Start the Backend**

```bash
npm run dev
```

You should see:
```
🚀 ABC Books API running on http://localhost:3001
📚 Database: Neon PostgreSQL
```

---

## 🎮 **Daily Usage**

### **Starting Your Work Day:**

1. Open PowerShell/Terminal
2. Run:
   ```bash
   cd "c:\Users\Danish\Desktop\ABC Books\backend"
   npm run dev
   ```
3. Leave the terminal open
4. Open your website in browser (Live Server on port 5500)

### **Stopping the Backend:**

Press `Ctrl + C` in the terminal

---

## ⚠️ **Common Issues & Solutions**

### **Problem 1: "Port 3001 already in use"**

**Cause:** Backend is already running somewhere

**Solution:**

```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# You'll see something like:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    22652
#                                                   ↑ This is the PID

# Kill that process (replace 22652 with your PID)
taskkill /PID 22652 /F

# Now start fresh
npm run dev
```

### **Problem 2: "Cannot connect to database"**

**Check:**
1. Is your internet working?
2. Is the `DATABASE_URL` in `.env` correct?
3. Is your Neon database active? (Check https://console.neon.tech/)

### **Problem 3: Frontend shows "Cannot connect to server"**

**Check:**
1. Is backend running? (Look for the terminal with `npm run dev`)
2. Does it say "Server running on http://localhost:3001"?
3. Try visiting http://localhost:3001/api/health in your browser

---

## 🧪 **Testing the Backend**

### **Test 1: Health Check**

Open browser and visit:
```
http://localhost:3001/api/health
```

Should show:
```json
{"status":"ok","message":"ABC Books API is running!"}
```

### **Test 2: Books API**

Visit:
```
http://localhost:3001/api/books
```

Should show a JSON array (might be empty if no books added)

### **Test 3: Using PowerShell**

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/health -UseBasicParsing
```

---

## 📊 **Backend Status Check**

### **Is it running?**

```bash
netstat -ano | findstr :3001
```

- **Output shown:** ✅ Backend is running
- **No output:** ❌ Backend is not running

### **What port is Live Server using?**

Look at your browser URL:
- `http://127.0.0.1:5500/` → Port 5500 ✅ (Configured)
- `http://localhost:5000/` → Port 5000 ✅ (Configured)

---

## 🔧 **Available Commands**

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start backend with auto-restart (recommended for development) |
| `npm start` | Start backend without auto-restart |
| `npm run setup-db` | Create/reset all database tables |
| `Ctrl + C` | Stop the backend |
| `rs` | Manually restart (when using `npm run dev`) |

---

## 📁 **Backend File Structure**

```
backend/
├── routes/           # API endpoints
│   ├── auth.js      # Login/signup
│   ├── books.js     # Books CRUD
│   ├── cart.js      # Shopping cart
│   ├── wishlist.js  # Wishlist
│   ├── orders.js    # Orders
│   └── users.js     # User management
├── server.js        # Main server file
├── .env             # Environment variables (DATABASE_URL, etc.)
├── package.json     # Dependencies
└── README.md        # Detailed documentation
```

---

## 🌐 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### **Books**
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Add book (admin)

### **Cart**
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart

### **Orders**
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order

---

## 💡 **Pro Tips**

1. ✅ **Use only ONE terminal** for the backend
2. ✅ **Keep the terminal visible** to see API logs
3. ✅ **Use `npm run dev`** (not `npm start`) for development
4. ✅ **Don't close the terminal** while using the website
5. ✅ **Watch for errors** in the terminal output

---

## 🎯 **Current Status**

✅ **Backend:** Running on port 3001  
✅ **Database:** Neon PostgreSQL (Connected)  
✅ **CORS:** Configured for Live Server (port 5500)  
✅ **Frontend:** Running on http://127.0.0.1:5500  

**Everything is working!** 🎉

---

## 📞 **Quick Troubleshooting Checklist**

- [ ] Is the backend terminal open and showing "Server running"?
- [ ] Is the port 3001 free (or backend using it)?
- [ ] Is your `.env` file present with correct DATABASE_URL?
- [ ] Is your internet working (for Neon database)?
- [ ] Is Live Server running your frontend?
- [ ] Did you refresh the browser after starting backend?

---

## 🚀 **You're All Set!**

Your backend is configured and ready to use. Just run `npm run dev` whenever you want to work on your project!

**Happy Coding!** 💻✨
