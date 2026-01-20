# 🚀 How to Run the ABC Books Backend

## ✅ Quick Start (Most Common)

### **Step 1: Open Terminal in Backend Folder**
```bash
cd "c:\Users\Danish\Desktop\ABC Books\backend"
```

### **Step 2: Start the Backend**
```bash
npm run dev
```

You should see:
```
🚀 ABC Books API running on http://localhost:3001
📚 Database: Neon PostgreSQL
```

### **Step 3: Keep Terminal Open**
- ✅ **DO NOT close this terminal window**
- ✅ The backend must stay running while you use the website
- ✅ You'll see API request logs here

---

## 🛑 How to Stop the Backend

Press `Ctrl + C` in the terminal where it's running.

---

## ⚠️ Troubleshooting

### **Error: "Port 3001 already in use"**

This means the backend is already running! You have two options:

#### **Option 1: Find the Running Instance**
Look through your open terminals - one of them already has the backend running. Just use that one!

#### **Option 2: Kill the Process and Restart**

1. Find what's using port 3001:
```bash
netstat -ano | findstr :3001
```

2. Look at the rightmost number (PID). For example:
```
TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    13136
                                                  ↑
                                                 PID
```

3. Kill that process:
```bash
taskkill /PID 13136 /F
```
(Replace `13136` with your actual PID)

4. Start fresh:
```bash
npm run dev
```

---

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development mode (auto-restarts on code changes) |
| `npm start` | Start in production mode |
| `npm run setup-db` | Create/reset database tables |

---

## 🧪 Testing the Backend

### **Test 1: Check if Backend is Running**

Open your browser and visit:
```
http://localhost:3001/api/health
```

You should see:
```json
{"status":"ok","message":"ABC Books API is running!"}
```

### **Test 2: Check Books API**

Visit:
```
http://localhost:3001/api/books
```

You should see a JSON array of books (might be empty if no books added yet).

### **Test 3: Using PowerShell**

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/health -UseBasicParsing
```

---

## 🎯 Common Workflow

### **Daily Development:**

1. **Morning:** Open terminal → `cd backend` → `npm run dev`
2. **Work:** Make changes to your code (nodemon auto-restarts)
3. **Evening:** Press `Ctrl + C` to stop

### **If You Restart Your Computer:**

1. Open terminal
2. `cd "c:\Users\Danish\Desktop\ABC Books\backend"`
3. `npm run dev`
4. Open your website in browser

---

## 🔍 Checking Backend Status

### **Is the backend running?**

Run this command:
```bash
netstat -ano | findstr :3001
```

- **If you see output:** Backend is running ✅
- **If no output:** Backend is not running ❌

---

## 💡 Pro Tips

1. **Use ONE terminal** for the backend - don't start multiple instances
2. **Keep the terminal visible** so you can see API logs
3. **Watch for errors** in the terminal output
4. **Auto-restart:** With `npm run dev`, the server automatically restarts when you edit code
5. **Manual restart:** Type `rs` in the nodemon terminal to manually restart

---

## 🌐 Frontend Connection

Your frontend is configured to connect to:
```
http://localhost:3001/api
```

Make sure:
- ✅ Backend is running on port 3001
- ✅ Frontend is running on Live Server (port 5500)
- ✅ CORS is configured (already done!)

---

## 📞 Need Help?

If you see errors:
1. Read the error message in the terminal
2. Check if port 3001 is already in use
3. Make sure your `.env` file has the correct `DATABASE_URL`
4. Try stopping and restarting the backend

---

**Current Status:** ✅ Backend is running on port 3001 (PID: 22652)
