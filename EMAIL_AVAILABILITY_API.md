# Email Availability Check API

Simple API to check if an email is available for registration.

**Endpoint:** `POST /api/v1/auth/check-email`

**Authentication:** Not required (public endpoint)

---

## Request

### cURL Command

```bash
curl -X POST http://localhost:3000/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

**Parameters:**

- `email` (string, required): The email address to check

---

## Response Examples

### Email Available

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Email is available",
  "data": {
    "available": true
  },
  "statusCode": 200
}
```

### Email Already Taken

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Email is already taken",
  "data": {
    "available": false
  },
  "statusCode": 200
}
```

### Missing Email

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Email is required",
  "statusCode": 400
}
```

### Invalid Email Format

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid email format",
  "statusCode": 400
}
```

---

## Testing Examples

### Check Available Email

```bash
curl -X POST http://localhost:3000/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}'
```

### Check Taken Email

```bash
curl -X POST http://localhost:3000/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com"}'
```

### With Production URL

```bash
curl -X POST https://your-domain.com/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## Notes

- Email is case-insensitive (automatically normalized to lowercase)
- Email format is validated before checking availability
- This endpoint does not require authentication
- Use this during registration forms for real-time email availability checking

---

**Last Updated:** January 2024
