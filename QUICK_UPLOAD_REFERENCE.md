# Quick Upload Reference Card

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend
```bash
npm run dev
```

### Step 2: Update Configuration (if needed)
Edit `data.js` and update:
- `API_URL` (for production)
- `AUTH_TOKEN` (if expired)

### Step 3: Run Upload Script

**macOS/Linux:**
```bash
./upload-universities.sh
```

**Windows:**
```cmd
upload-universities.bat
```

**Or directly:**
```bash
node data.js
# or
bun data.js
```

---

## ⚙️ Quick Configuration

Open `data.js` and find the `CONFIG` section:

```javascript
const CONFIG = {
  API_URL: "http://localhost:5001/api/v1/auth/register",
  BATCH_SIZE: 5,              // ⬆️ Increase for faster (10-15)
  DELAY_BETWEEN_REQUESTS: 1000, // ⬆️ Increase if getting errors (2000-3000)
  DELAY_BETWEEN_BATCHES: 3000,  // ⬆️ Increase if server struggles (5000)
  MAX_RETRIES: 3,             // ⬆️ Increase if network is unstable
};
```

---

## 📊 Understanding the Output

| Symbol | Meaning |
|--------|---------|
| ✅ | Successfully uploaded |
| ⏭️ | Already exists (skipped) |
| ❌ | Failed (will retry) |
| ⚠️ | Retrying... |
| 📦 | Processing batch |
| ⏳ | Waiting between batches |

---

## 🔧 Common Issues & Fixes

### "Request timeout"
```javascript
TIMEOUT: 60000, // Increase timeout
```

### "Connection refused"
- Backend not running → `npm run dev`

### "401 Unauthorized"
- Token expired → Get new admin token

### Too many failures
```javascript
BATCH_SIZE: 3,              // Reduce batch size
DELAY_BETWEEN_REQUESTS: 2000, // Increase delay
```

---

## 🎯 Production Checklist

- [ ] Backend server running on production URL
- [ ] MongoDB connected and accessible
- [ ] Valid admin authentication token
- [ ] Updated API_URL to production endpoint
- [ ] Tested with small batch first (BATCH_SIZE: 2)
- [ ] Backup existing database (if any)

---

## 📈 Expected Time

**~2,300 universities with default settings:**
- Estimated time: **2-3 hours**
- Can be faster with higher BATCH_SIZE and lower delays
- Resume any time (skips already uploaded)

---

## 💡 Pro Tips

1. **Run in `screen` or `tmux`** for long uploads:
   ```bash
   screen -S upload
   node data.js
   # Ctrl+A, D to detach
   ```

2. **Monitor progress from another terminal:**
   ```bash
   tail -f upload.log  # if logging to file
   ```

3. **Test first with a small dataset:**
   ```javascript
   // In data.js, temporarily limit data
   let data = [...].slice(0, 10); // Test with 10 universities
   ```

4. **For fastest upload (if server can handle it):**
   ```javascript
   BATCH_SIZE: 15,
   DELAY_BETWEEN_REQUESTS: 500,
   DELAY_BETWEEN_BATCHES: 2000,
   ```

---

## 📞 Emergency Stop

If you need to stop the upload:
- Press `Ctrl+C` 
- Script is safe to stop and resume
- Already uploaded universities will be skipped on next run

---

**Need detailed help?** → See `UNIVERSITY_UPLOAD_GUIDE.md`

