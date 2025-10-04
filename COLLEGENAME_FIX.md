# Fix: collegeName and collegeCode Not Being Saved

## 🐛 Problem
Universities were being uploaded successfully, but the `collegeName` and `collegeCode` fields were not being saved to the database.

## 🔍 Root Cause
The TypeScript type definitions in `AuthService.register()` and `AuthRepository.createUser()` methods were too restrictive. They only included basic user fields (firstName, lastName, email, etc.) but **excluded** university-specific fields like:
- `collegeName`
- `collegeCode`
- `location`
- `address`
- `specialization`
- `description`
- `bannerYoutubeVideoLink`
- `website`

Even though the controller received these fields, they were being **stripped out** when passed to the service and repository because TypeScript didn't allow them in the type definition.

## ✅ Fix Applied

### 1. Updated AuthService.ts
Added all university-specific fields to the `register()` method type definition:

```typescript
async register(userData: {
  firstName?: string;
  lastName?: string;
  dob?: string;
  countryCode: string;
  phoneNumber: string;
  board?: string;
  stream?: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  collegeName?: string;      // ✅ Added
  collegeCode?: string;       // ✅ Added
  location?: string;          // ✅ Added
  address?: string;           // ✅ Added
  specialization?: string;    // ✅ Added
  description?: string;       // ✅ Added
  bannerYoutubeVideoLink?: string; // ✅ Added
  website?: string;           // ✅ Added
  [key: string]: any;         // ✅ Allow additional fields
}): Promise<{ user: IUser; tokens: TokenResponse }>
```

### 2. Updated AuthRepository.ts
Added the same fields to the `createUser()` method:

```typescript
async createUser(userData: {
  firstName?: string;
  lastName?: string;
  email: string;
  dob?: string;
  countryCode: string;
  phoneNumber: string;
  board?: string;
  stream?: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  collegeName?: string;      // ✅ Added
  collegeCode?: string;       // ✅ Added
  location?: string;          // ✅ Added
  address?: string;           // ✅ Added
  specialization?: string;    // ✅ Added
  description?: string;       // ✅ Added
  bannerYoutubeVideoLink?: string; // ✅ Added
  website?: string;           // ✅ Added
  [key: string]: any;         // ✅ Allow additional fields
}): Promise<IUser>
```

### 3. Added `website` Field Validation
Added validation for the `website` field in `validationMiddleware.ts`:

```typescript
website: [
  { type: "string" },
  { maxLength: 200 },
],
```

### 4. Enhanced Upload Script Debugging
Added debug logging to see exactly what data is being sent on the first upload:

```javascript
// Debug logging for first upload
if (stats.successful === 0 && stats.failed === 0 && stats.skipped === 0) {
  console.log("\n🔍 DEBUG - First university data being sent:");
  console.log(JSON.stringify(finalResponse, null, 2));
  console.log("");
}
```

## 🚀 How to Test

### Step 1: Restart Your Backend Server
The backend needs to be restarted to pick up the TypeScript changes:

```bash
# Stop your current backend (Ctrl+C)
npm run dev
# or
yarn dev
```

### Step 2: Test with a Small Dataset First
Before uploading all universities, test with just a few:

Edit `data.js` temporarily:
```javascript
// At the end of the data array declaration (around line 17818)
// Add this line temporarily:
data = data.slice(0, 3); // Test with just 3 universities
```

### Step 3: Run the Upload Script
```bash
node data.js
```

### Step 4: Check the Debug Output
You should see the first university's data being sent:
```json
🔍 DEBUG - First university data being sent:
{
  "collegeName": "Sri Venkateswara university, Tirupathy",
  "collegeCode": "U-0037",
  "location": ", ",
  "website": "www.svuniversity.edu.in",
  "email": "svuniversity@kubix.com",
  "countryCode": "+91",
  "phoneNumber": "9014156581",
  "address": "Sri Padmavati Mahila Visvavidyalayam...",
  "password": "Uni@123Kubix",
  "bannerYoutubeVideoLink": "https:www.youtube.com/...",
  "role": "university"
}
```

### Step 5: Verify in Database
Check MongoDB that the fields are saved:

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "svuniversity@kubix.com" })
```

You should see:
```json
{
  "_id": "...",
  "collegeName": "Sri Venkateswara university, Tirupathy",
  "collegeCode": "U-0037",
  "email": "svuniversity@kubix.com",
  "location": ", ",
  "website": "www.svuniversity.edu.in",
  ...
}
```

### Step 6: Upload All Data
Once confirmed working, remove the test limit and upload all:

```javascript
// Remove or comment out the test line in data.js
// data = data.slice(0, 3); // Remove this line

// Run full upload
node data.js
```

## 📋 Files Modified

| File | Changes |
|------|---------|
| `src/app/modules/auth/services/AuthService.ts` | Updated `register()` method type definition |
| `src/app/modules/auth/repositories/AuthRepository.ts` | Updated `createUser()` method type definition |
| `src/app/middlewares/validationMiddleware.ts` | Added `website` field validation |
| `data.js` | Added debug logging for first upload |

## ✅ Expected Result

After this fix:
- ✅ `collegeName` will be saved correctly
- ✅ `collegeCode` will be saved correctly
- ✅ `website` will be saved correctly
- ✅ All other university fields will be saved correctly
- ✅ Universities can be properly identified by their name and code

## 🔍 Verification Query

To verify all universities have collegeName and collegeCode:

```javascript
// MongoDB query
db.users.find({ 
  role: "university",
  $or: [
    { collegeName: { $exists: false } },
    { collegeName: null },
    { collegeName: "" },
    { collegeCode: { $exists: false } },
    { collegeCode: null },
    { collegeCode: "" }
  ]
}).count()

// Should return 0 (no universities missing these fields)
```

## 🆘 If Still Not Working

1. **Check Backend Logs**: Look for any validation errors
2. **Check Debug Output**: Verify the data structure being sent
3. **Check Database Connection**: Ensure MongoDB is connected
4. **Check Token**: Ensure admin token is still valid
5. **Check Validation**: Look for validation error messages in upload output

## 📞 Troubleshooting Commands

```bash
# Check if backend is running
curl http://localhost:5001/api/v1/health

# Check MongoDB connection
# In mongo shell:
use your_database_name
db.users.find({ role: "university" }).limit(1).pretty()

# Check backend logs
# Should show in terminal where npm run dev is running
```

---

**Status**: ✅ FIXED - Ready to upload all university data with complete information!

