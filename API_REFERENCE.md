# OTP System API Reference

## Signup Flow API Endpoints

### 1. Request Signup OTP
```
POST /api/auth/request-signup-otp
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "password": "Password@123",
  "gender": "Male"  // Optional: Male, Female, Other
}

Success Response (200):
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete signup."
}

Error Responses:
- 400: "Only Gmail accounts (@gmail.com) are allowed"
- 400: "Password must be more than 6 characters"
- 400: "Password can only contain letters, numbers, @ and ! symbols"
- 400: "User with this email already exists"
- 500: "Server error during signup request"
```

### 2. Verify Signup OTP
```
POST /api/auth/verify-signup-otp
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com",
  "otp": "123456"
}

Success Response (201):
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f7a3c8b9e2f1a2c3d4e5f6",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "user"
  }
}

Error Responses:
- 400: "Please provide email and OTP"
- 400: "Invalid or expired OTP"
- 400: "OTP has expired. Please request a new one."
- 500: "Server error during verification"
```

### 3. Resend Signup OTP
```
POST /api/auth/resend-signup-otp
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com"
}

Success Response (200):
{
  "success": true,
  "message": "New OTP sent to your email"
}

Error Responses:
- 400: "Please provide email"
- 400: "No pending signup verification found for this email"
- 500: "Failed to resend OTP"
```

---

## Password Reset Flow API Endpoints

### 1. Request Password Reset OTP
```
POST /api/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com"
}

Success Response (200):
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}

Error Responses:
- 400: "Please provide email"
- 400: "Only Gmail accounts (@gmail.com) are allowed"
- 404: "No account found with this email"
- 500: "Server error. Please try again later."
```

### 2. Verify Password Reset OTP
```
POST /api/auth/verify-reset-otp
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com",
  "otp": "123456"
}

Success Response (200):
{
  "success": true,
  "message": "OTP verified successfully"
}

Error Responses:
- 400: "Please provide email and OTP"
- 400: "Invalid or expired OTP"
- 400: "OTP has expired. Please request a new one."
- 500: "Server error. Please try again later."
```

### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}

Success Response (200):
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}

Error Responses:
- 400: "Please provide email, OTP, and new password"
- 400: "Password must be more than 6 characters"
- 400: "Password can only contain letters, numbers, @ and ! symbols"
- 400: "Invalid OTP"
- 400: "OTP has expired. Please request a new one."
- 404: "User not found"
- 500: "Server error. Please try again later."
```

### 4. Resend Password Reset OTP
```
POST /api/auth/resend-forgot-otp
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com"
}

Success Response (200):
{
  "success": true,
  "message": "New password reset OTP sent to your email"
}

Error Responses:
- 400: "Please provide email"
- 400: "No pending password reset found for this email"
- 500: "Failed to resend OTP"
```

---

## Login (Unchanged)
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john.doe@gmail.com",
  "password": "Password@123"
}

Success Response (200):
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f7a3c8b9e2f1a2c3d4e5f6",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "user"
  }
}

Error Responses:
- 400: "Please provide email and password"
- 401: "Invalid email or password"
- 500: "Server error during login"
```

---

## Backward Compatibility

### Old Endpoints (Still Work)
These endpoints are maintained for backward compatibility:

#### POST /api/auth/verify-otp
Redirects to `verify-signup-otp` internally

#### POST /api/auth/resend-otp
Redirects to `resend-signup-otp` internally

#### POST /api/auth/signup
Now returns error directing to use OTP flow

---

## Response Format

All API responses follow this format:

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}  // Optional
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"  // Optional
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

## Testing with cURL

### Request Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/request-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "password": "Password@123",
    "gender": "Male"
  }'
```

### Verify Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "otp": "123456"
  }'
```

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com"
  }'
```

---

## OTP Specifications

| Property | Value |
|----------|-------|
| Length | 6 digits |
| Format | Numeric only |
| Expiration | 10 minutes |
| Auto-delete | Yes (MongoDB TTL) |
| Email restriction | Gmail only (@gmail.com) |
