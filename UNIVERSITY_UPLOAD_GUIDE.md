# University Data Upload Guide

## Overview
This guide explains how to use the production-ready university data upload script (`data.js`).

## Features ✨

The improved upload script includes:
- ✅ **Batch Processing**: Uploads universities in controlled batches to prevent server overload
- ✅ **Error Handling**: Automatic retry logic with exponential backoff
- ✅ **Progress Tracking**: Real-time progress updates with detailed statistics
- ✅ **Resume Capability**: Automatically skips already uploaded universities
- ✅ **Timeout Protection**: 30-second timeout per request to prevent hanging
- ✅ **Rate Limiting**: Configurable delays between requests and batches
- ✅ **Detailed Logging**: Success/failure tracking with comprehensive error messages
- ✅ **Production Ready**: Safe for production use with proper error recovery

## Configuration

The script can be configured at the top of `data.js`:

```javascript
const CONFIG = {
  API_URL: "http://localhost:5001/api/v1/auth/register", // API endpoint
  AUTH_TOKEN: "Bearer ...", // Admin authentication token
  BATCH_SIZE: 5, // Process 5 universities at a time
  DELAY_BETWEEN_REQUESTS: 1000, // 1 second between requests
  DELAY_BETWEEN_BATCHES: 3000, // 3 seconds between batches
  MAX_RETRIES: 3, // Retry failed requests 3 times
  TIMEOUT: 30000, // 30 second timeout per request
};
```

### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `API_URL` | localhost:5001 | API endpoint (change to production URL when ready) |
| `AUTH_TOKEN` | Bearer token | Admin authentication token for API access |
| `BATCH_SIZE` | 5 | Number of universities to process simultaneously |
| `DELAY_BETWEEN_REQUESTS` | 1000ms | Delay between individual requests (prevents rate limiting) |
| `DELAY_BETWEEN_BATCHES` | 3000ms | Delay between batches (allows server to recover) |
| `MAX_RETRIES` | 3 | Number of retry attempts for failed uploads |
| `TIMEOUT` | 30000ms | Request timeout in milliseconds |

## How to Use

### Prerequisites

1. **Start your backend server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Ensure your MongoDB is connected** and accessible

3. **Verify your admin authentication token** is valid and has not expired

### Running the Script

#### Option 1: Using Node.js
```bash
node data.js
```

#### Option 2: Using Bun (faster)
```bash
bun data.js
```

### What Happens During Upload

1. **Initialization**: The script displays configuration and total count
2. **Batch Processing**: Universities are processed in batches of 5 (configurable)
3. **Real-time Progress**: Each upload shows status (✅ success, ⏭️ skipped, ❌ failed)
4. **Automatic Retry**: Failed uploads are retried up to 3 times with exponential backoff
5. **Final Summary**: Detailed statistics and list of any failures

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║      UNIVERSITY DATA UPLOAD SCRIPT - PRODUCTION MODE      ║
╚════════════════════════════════════════════════════════════╝

📊 Total universities to upload: 2300
⚙️  Batch size: 5
⏱️  Delay between requests: 1000ms
⏱️  Delay between batches: 3000ms
🔄 Max retries per university: 3
🌐 API URL: http://localhost:5001/api/v1/auth/register

Starting upload process...

════════════════════════════════════════════════════════════

📦 Total batches: 460

📦 Processing Batch 1 (5 universities)...
✅ [1/2300] Successfully uploaded: Sri Venkateswara university, Tirupathy (svuniversity@kubix.com)
✅ [2/2300] Successfully uploaded: Indian Institute of Information Technology (iiitk@kubix.com)
...
```

## Switching to Production

When ready to upload to production:

1. **Update the API URL** in `data.js`:
   ```javascript
   API_URL: "https://api.thekubixgroup.com/api/v1/auth/register",
   ```

2. **Get a fresh admin token** from production

3. **Update the AUTH_TOKEN** in `data.js`

4. **Test with a small batch first**:
   ```javascript
   BATCH_SIZE: 2, // Start small
   ```

5. **Monitor the first batch carefully** before proceeding

## Troubleshooting

### Issue: "Request timeout"
**Solution**: Increase the `TIMEOUT` value or check your network connection
```javascript
TIMEOUT: 60000, // Increase to 60 seconds
```

### Issue: Too many failures
**Solutions**:
- Check if backend server is running
- Verify AUTH_TOKEN is valid
- Reduce BATCH_SIZE to prevent overwhelming the server
- Increase delays between requests

### Issue: "Already exists" for all universities
**Solution**: This is normal if you're re-running the script. Universities already in the database are automatically skipped.

### Issue: Connection refused
**Solution**: Ensure your backend server is running on the correct port (5001)

### Issue: 401 Unauthorized
**Solution**: Your AUTH_TOKEN has expired. Get a new admin token and update the script.

## Performance Tips

### For Faster Uploads (if server can handle it):
```javascript
BATCH_SIZE: 10,
DELAY_BETWEEN_REQUESTS: 500,
DELAY_BETWEEN_BATCHES: 2000,
```

### For Slower/Safer Uploads (recommended for production):
```javascript
BATCH_SIZE: 3,
DELAY_BETWEEN_REQUESTS: 2000,
DELAY_BETWEEN_BATCHES: 5000,
```

## Data Validation

The script automatically:
- ✅ Converts phone numbers to strings
- ✅ Handles missing or optional fields
- ✅ Validates required fields (email, password, role)
- ✅ Skips duplicates based on email address

## Statistics Tracking

The script tracks:
- Total universities processed
- Successful uploads
- Skipped uploads (already exist)
- Failed uploads with error details
- Total execution time
- Average time per university

## Error Recovery

If the script fails:
1. **Note the last successful upload** from the console output
2. **Check the error messages** for specific issues
3. **Fix any data issues** in `data.js` if needed
4. **Re-run the script** - it will automatically skip already uploaded universities

## Security Notes

⚠️ **Important Security Reminders**:
- Never commit `data.js` with real authentication tokens to version control
- Store sensitive tokens in environment variables for production
- Rotate admin tokens regularly
- Use `.gitignore` to exclude `data.js` if it contains sensitive data

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all configuration values are correct
3. Ensure backend server is running and accessible
4. Check MongoDB connection status
5. Review the "FAILED UPLOADS" section in the final summary

## Data Structure

Each university record should have:
```javascript
{
  collageName: "University Name",
  collageCode: "U-0001",
  location: "City, State",
  website: "www.example.edu",
  email: "unique@kubix.com",
  countryCode: "+91",
  phoneNumber: "1234567890",
  address: "Full address",
  password: "Uni@123Kubix",
  bannerYoutubeVideoLink: "https://youtube.com/...",
  role: "university"
}
```

## Next Steps

After successful upload:
1. Verify universities in the database
2. Check university count matches expected total
3. Test login for a few universities
4. Review any failed uploads and retry manually if needed
5. Archive or backup the upload script

---

**Script Version**: 2.0 (Production Ready)
**Last Updated**: October 2025

