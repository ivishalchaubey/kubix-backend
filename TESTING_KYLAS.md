# Kylas CRM Integration - Testing Guide

This guide provides step-by-step instructions for testing the Kylas CRM integration.

## Prerequisites

1. ✅ Kylas API key configured in `.env`
2. ✅ Custom fields created in Kylas CRM
3. ✅ Backend server running

---

## Quick Test - Automated Script

The fastest way to test the integration is using the automated test script:

```bash
node test-kylas-integration.js
```

This will test:

- ✅ API connection
- ✅ Lead creation
- ✅ Lead search
- ✅ Lead update (activity tracking)
- ✅ Adding notes to leads

**Expected Output:**

```
╔═══════════════════════════════════════════╗
║   KYLAS CRM INTEGRATION TEST SUITE      ║
╚═══════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 1: Testing Kylas API Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Successfully connected to Kylas API

... (more test results)

╔═══════════════════════════════════════════╗
║          TEST RESULTS SUMMARY            ║
╚═══════════════════════════════════════════╝

✓ Connection Test:     PASSED
✓ Lead Creation Test:  PASSED
✓ Lead Search Test:    PASSED
✓ Lead Update Test:    PASSED
✓ Add Note Test:       PASSED

Total: 5/5 tests passed

🎉 All tests passed! Kylas CRM integration is working correctly.
```

---

## Manual Testing - Step by Step

### Step 1: Test User Registration (Lead Creation)

**Start your backend server:**

```bash
npm run dev
```

**Register a new user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student@example.com",
    "password": "Test@123456",
    "role": "user",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "board": "CBSE",
    "stream": "Medical",
    "grade": "12th",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

**What to Check:**

1. **Server Logs** - Look for:

   ```
   Kylas API Request: POST /leads/
   Created Kylas lead for test.student@example.com with ID: 12345
   ```

2. **Kylas CRM Dashboard** - Visit https://app.kylas.io/leads

   - You should see a new lead for "Test Student"
   - Email: test.student@example.com
   - Custom fields should have:
     - Board: CBSE
     - Stream: Medical
     - Grade: 12th

3. **API Response** - Should return:
   ```json
   {
     "success": true,
     "message": "User created successfully",
     "data": {
       "user": { ... },
       "tokens": { ... }
     }
   }
   ```

---

### Step 2: Test Career Field Selection

**Login with the test user and get the token:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.student@example.com",
    "password": "Test@123456",
    "role": "user"
  }'
```

**Copy the access token from the response, then update profile:**

```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "categoryIds": ["category_id_1", "category_id_2"]
  }'
```

**What to Check:**

1. **Server Logs** - Look for:

   ```
   Tracked career_field_selected for test.student@example.com
   ```

2. **Kylas CRM Dashboard** - Check the lead:
   - Custom field `cf_career_field` should be updated with category IDs

---

### Step 3: Test Course Shortlisting

**Shortlist a course:**

```bash
curl -X POST http://localhost:5000/api/shortlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "itemId": "course_12345",
    "itemType": "course"
  }'
```

**What to Check:**

1. **Server Logs** - Look for:

   ```
   Shortlist added for user ...
   Tracked course_shortlisted for test.student@example.com
   ```

2. **Kylas CRM Dashboard** - Check the lead:
   - Custom field `cf_shortlisted_courses` should contain the course ID

---

### Step 4: Test College Shortlisting

**Shortlist a college:**

```bash
curl -X POST http://localhost:5000/api/shortlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "itemId": "college_67890",
    "itemType": "colleges"
  }'
```

**What to Check:**

1. **Server Logs** - Look for:

   ```
   Shortlist added for user ...
   Tracked college_shortlisted for test.student@example.com
   ```

2. **Kylas CRM Dashboard** - Check the lead:
   - Custom field `cf_shortlisted_colleges` should contain the college ID

---

### Step 5: Test Course Application

**Submit an application:**

```bash
curl -X POST http://localhost:5000/api/application-form \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "collegeIds": ["college_123", "college_456"],
    "firstName": "Test",
    "lastName": "Student",
    "dateOfBirth": "2005-05-15",
    "phoneCountryCode": "+91",
    "phoneNumber": "9876543210",
    "email": "test.student@example.com",
    "tenthPercentage": "85",
    "tenthMarksheet": "https://example.com/marksheet.pdf",
    "guardianName": "Parent Name",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "9876543211"
  }'
```

**What to Check:**

1. **Server Logs** - Look for:

   ```
   Application form saved for user ...
   Tracked course_applied for test.student@example.com
   ```

2. **Kylas CRM Dashboard** - Check the lead:
   - Custom field `cf_applied_courses` should contain the college IDs

---

## Testing Error Handling

### Test 1: Registration with Kylas Down

1. **Temporarily set invalid API key** in `.env`:

   ```env
   KYLAS_API_KEY=invalid_key_for_testing
   ```

2. **Register a new user** (use different email)

3. **Expected Behavior:**

   - User registration should **still succeed**
   - Server logs should show:
     ```
     Kylas API Error Response: { status: 401, ... }
     Failed to create Kylas lead (non-blocking): ...
     ```
   - User can still log in and use the app

4. **Restore valid API key** in `.env`

---

### Test 2: Duplicate Lead Prevention

1. **Register the same user twice** with same email
2. **Expected Behavior:**
   - Second registration should fail with "Email already exists"
   - Only ONE lead should exist in Kylas CRM

---

## Verifying in Kylas CRM Dashboard

### Step 1: Login to Kylas

Visit https://app.kylas.io/ and login

### Step 2: View Leads

Go to **Leads** section

### Step 3: Find Your Test Lead

Search for the test email: `test.student@example.com`

### Step 4: Verify Data

**Basic Information:**

- ✅ Name: Test Student
- ✅ Email: test.student@example.com
- ✅ Phone: +91 9876543210
- ✅ City: Mumbai
- ✅ State: Maharashtra

**Custom Fields:**

- ✅ Board: CBSE
- ✅ Stream: Medical
- ✅ Grade: 12th
- ✅ Career Field: (category IDs)
- ✅ Shortlisted Courses: (course IDs)
- ✅ Shortlisted Colleges: (college IDs)
- ✅ Applied Courses: (college IDs)

**Activity Timeline:**

- Lead created event
- Profile update events
- Notes (if added)

---

## Troubleshooting

### Issue: "KYLAS_API_KEY is not configured"

**Solution:**

1. Check `.env` file has `KYLAS_API_KEY=your_actual_key`
2. Restart your backend server after adding the key

---

### Issue: "Failed to connect to Kylas API"

**Possible Causes:**

1. Invalid API key
2. Network connectivity issues
3. Kylas API is down

**Solution:**

1. Verify API key at https://app.kylas.io/setup/integrations/api-keys/list
2. Check internet connection
3. Try the test script: `node test-kylas-integration.js`

---

### Issue: Custom fields not appearing in Kylas

**Solution:**

1. Create custom fields in Kylas at https://app.kylas.io/setup/fields/leads/list
2. Update field names in `KylasConfig.ts`:
   ```typescript
   CUSTOM_FIELDS: {
     CAREER_FIELD: 'cf_your_actual_field_name',
     // ... update all field names
   }
   ```
3. Restart backend server

---

### Issue: "Property 'customFieldValues' not found"

**Solution:**
This means the custom field doesn't exist in your Kylas account. Create it first, then update `KylasConfig.ts`.

---

## Success Criteria

Your integration is working correctly if:

✅ Test script passes all 5 tests
✅ User registration creates a lead in Kylas
✅ Lead has correct student information
✅ Career field selection updates the lead
✅ Course shortlisting updates the lead
✅ College shortlisting updates the lead  
✅ Course applications update the lead
✅ Server logs show all Kylas operations
✅ User operations work even if Kylas is down

---

## Next Steps After Testing

1. **Clean up test data** - Delete test leads from Kylas dashboard
2. **Update custom field names** in `KylasConfig.ts` with your actual field IDs
3. **Monitor production logs** for the first few real registrations
4. **Set up monitoring/alerts** (optional) for Kylas integration failures

---

## Performance Testing (Optional)

To test performance under load:

```bash
# Install artillery if not already installed
npm install -g artillery

# Create a simple load test
artillery quick --count 10 --num 5 http://localhost:5000/api/auth/register
```

**Expected:**

- All registrations should succeed
- Kylas operations should not significantly slow down registration
- Server should handle gracefully if Kylas rate limits are hit
