# 🌐 Running ABC Books on Localhost

## 📋 **QUICK START OPTIONS**

You have **3 easy options** to run ABC Books locally:

---

## ✅ **OPTION 1: Python HTTP Server (Easiest - Recommended)**

### **If you have Python installed:**

**Step 1:** Open Command Prompt/Terminal in the ABC Books folder
```bash
cd "c:\Users\Danish\Desktop\ABC Books"
```

**Step 2:** Run Python server
```bash
# For Python 3.x (most common)
python -m http.server 5000

# OR for Python 2.x
python -m SimpleHTTPServer 5000
```

**Step 3:** Open browser and go to:
```
http://localhost:5000
```

✅ **Done!** Your website is now running on port 5000!

---

## ✅ **OPTION 2: Node.js HTTP Server**

### **If you have Node.js installed:**

**Step 1:** Install http-server globally (one-time only)
```bash
npm install -g http-server
```

**Step 2:** Navigate to ABC Books folder
```bash
cd "c:\Users\Danish\Desktop\ABC Books"
```

**Step 3:** Run the server
```bash
# Run on port 5000
http-server -p 5000

# OR with auto-open browser
http-server -p 5000 -o
```

**Step 4:** Open browser and go to:
```
http://localhost:5000
```

✅ **Done!** Your website is now running on port 5000!

---

## ✅ **OPTION 3: VS Code Live Server Extension**

### **If you use Visual Studio Code:**

**Step 1:** Install "Live Server" extension
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Live Server" by Ritwick Dey
- Click Install

**Step 2:** Configure port (optional)
- Go to Settings (Ctrl+,)
- Search for "Live Server Port"
- Set to `5000`

**Step 3:** Start the server
- Right-click on `index.html`
- Click "Open with Live Server"

✅ **Done!** Your website opens automatically!

**Default port:** 5500 (or 5000 if you configured it)

---

## 🎯 **RECOMMENDED SETUP**

### **For Frontend Only (What you need now):**
```
Frontend (HTML/CSS/JS) → Port 5000 (or any port you choose)
```

Use **Option 1 (Python)** or **Option 2 (Node.js http-server)**

---

### **For Full Stack (Frontend + Backend):**
```
Frontend (HTML/CSS/JS) → Port 5000
Backend (Node.js API)  → Port 3001
```

**Frontend on Port 5000:**
```bash
# Terminal 1
cd "c:\Users\Danish\Desktop\ABC Books"
python -m http.server 5000
```

**Backend on Port 3001:**
```bash
# Terminal 2
cd "c:\Users\Danish\Desktop\ABC Books\backend"
npm install
npm start
```

---

## 📝 **PORT CONFIGURATION**

### **Current Setup:**
- **Frontend:** Can run on ANY port (5000, 8000, 3000, etc.)
- **Backend:** Configured for **Port 3001** (in `backend/server.js`)

### **To Change Backend Port:**
Edit `backend/server.js` line 18:
```javascript
const PORT = process.env.PORT || 3001;  // Change 3001 to your desired port
```

Or create `.env` file in backend folder:
```env
PORT=5000
```

---

## 🚀 **STEP-BY-STEP: RUNNING ON PORT 5000**

### **Using Python (Simplest):**

1. **Open Command Prompt**
   - Press `Win + R`
   - Type `cmd` and press Enter

2. **Navigate to ABC Books folder**
   ```bash
   cd "c:\Users\Danish\Desktop\ABC Books"
   ```

3. **Check if Python is installed**
   ```bash
   python --version
   ```
   
   If you see a version number (e.g., Python 3.11.0), you're good!
   
   If not, download from: https://www.python.org/downloads/

4. **Start the server**
   ```bash
   python -m http.server 5000
   ```

5. **You should see:**
   ```
   Serving HTTP on :: port 5000 (http://[::]:5000/) ...
   ```

6. **Open your browser**
   - Go to: `http://localhost:5000`
   - Or: `http://127.0.0.1:5000`

7. **To stop the server**
   - Press `Ctrl + C` in the terminal

---

## 🔧 **TROUBLESHOOTING**

### **"Port 5000 is already in use"**
**Solution:** Use a different port
```bash
python -m http.server 8000
# Then open: http://localhost:8000
```

### **"Python is not recognized"**
**Solution:** Install Python
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"

### **"CORS errors in console"**
**Solution:** This is normal for local development
- The website will still work
- CORS issues only affect API calls (which need backend)

### **"Cannot find module 'express'"**
**This is for backend only!**
- Navigate to backend folder
- Run `npm install`
- Then run `npm start`

---

## 📊 **WHAT EACH PORT DOES**

| Port | Service | Purpose |
|------|---------|---------|
| **5000** | Frontend Server | Serves HTML/CSS/JS files |
| **3001** | Backend API | Handles database operations |
| **5432** | PostgreSQL | Neon database (cloud) |

---

## ✨ **QUICK REFERENCE**

### **Start Frontend on Port 5000:**
```bash
cd "c:\Users\Danish\Desktop\ABC Books"
python -m http.server 5000
```

### **Start Backend on Port 3001:**
```bash
cd "c:\Users\Danish\Desktop\ABC Books\backend"
npm install
npm start
```

### **Access Website:**
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:3001/api/health`

---

## 🎯 **WHAT YOU NEED RIGHT NOW**

**For testing the checkout fix:**
- ✅ Just run frontend on port 5000
- ✅ No backend needed (using localStorage)
- ✅ Use Python or Node.js http-server

**For production:**
- ⏳ Run both frontend AND backend
- ⏳ Set up Neon database
- ⏳ Connect frontend to backend API

---

## 💡 **MY RECOMMENDATION**

**Right now, do this:**

1. **Open Command Prompt**
2. **Run these commands:**
   ```bash
   cd "c:\Users\Danish\Desktop\ABC Books"
   python -m http.server 5000
   ```
3. **Open browser:** `http://localhost:5000`
4. **Test the checkout!**

**That's it!** 🎉

---

**Need help?** Let me know which option you want to use!
