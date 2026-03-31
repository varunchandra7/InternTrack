# NEW OTP SYSTEM DOCUMENTATION

## Overview
The new OTP system has been implemented to provide secure email verification for both account creation and password reset. The system is built on a unified architecture that reduces code duplication and improves maintainability.

## Key Features
- **Gmail-only restriction**: Both signup and password reset are restricted to Gmail accounts (@gmail.com)
- **10-minute expiration**: OTPs automatically expire after 10 minutes
- **Unified service**: Centralized OTP utility service for both signup and password reset flows
- **Purpose tracking**: OTP records now track whether they're for signup or password-reset
- **Improved error handling**: Clear, user-friendly error messages

## System Architecture

### Backend Components

#### 1. OTP Model (`backend/models/OTP.js`)
```javascript
{
  email: String,           // User's email
  otp: String,            // 6-digit OTP
  purpose: String,        // 'signup' or 'password-reset'
  userData: {             // User data for signup
    name: String,
    password: String,
    gender: String
  },
  createdAt: Date        // Auto-expires after 10 minutes
}
```

#### 2. OTP Service (`backend/services/otpService.js`)
Unified service containing:
- `generateOTP()` - Generate 6-digit OTP
- `createSignupOTP()` - Create OTP for signup
- `createPasswordResetOTP()` - Create OTP for password reset
- `verifySignupOTP()` - Verify signup OTP
- `verifyPasswordResetOTP()` - Verify password reset OTP
- `resendSignupOTP()` - Resend signup OTP
- `resendPasswordResetOTP()` - Resend password reset OTP
- `deleteOTP()` - Delete OTP record

#### 3. Auth Routes (`backend/routes/auth.js`)
Updated endpoints:
- `POST /auth/request-signup-otp` - Request OTP for signup (replaces old signup)
- `POST /auth/verify-signup-otp` - Verify OTP and create account
- `POST /auth/resend-signup-otp` - Resend signup OTP
- `POST /auth/forgot-password` - Request OTP for password reset
- `POST /auth/verify-reset-otp` - Verify password reset OTP
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/resend-forgot-otp` - Resend password reset OTP

### Frontend Components

#### 1. Signup Flow
**Files**: `index.html`, `script.js`, `signup-otp.html`, `signup-otp.js`

**Flow**:
1. User fills signup form on home page (name, email, password, gender)
2. Form validation checks:
   - Email must be valid Gmail (@gmail.com)
   - Password must be > 6 characters
   - Password can only contain letters, numbers, @, and !
   - Passwords must match
   - Terms & Conditions must be accepted
3. Submission sends `POST /auth/request-signup-otp`
4. User is redirected to `signup-otp.html?email={email}`
5. User enters 6-digit OTP
6. Verification sends `POST /auth/verify-signup-otp`
7. On success: User stored in database, token generated, redirect to dashboard

#### 2. Password Reset Flow
**Files**: `forgot-password.html`, `forgot-password.js`, `reset-password.html`, `reset-password.js`, `new-password.html`, `new-password.js`

**Flow**:
1. User enters email on forgot-password page
2. Validation: Email must be valid Gmail
3. Submission sends `POST /auth/forgot-password`
4. User redirected to `reset-password.html?email={email}`
5. User enters 6-digit OTP
6. Verification sends `POST /auth/verify-reset-otp`
7. User redirected to `new-password.html`
8. User enters new password
9. Final submission sends `POST /auth/reset-password` with OTP and new password
10. Password updated in database

## OTP Flow Diagrams

### Signup Flow
```
Login Page
    ↓
[Enter Name, Email, Password, Gender, Accept Terms]
    ↓
Request Signup OTP (POST /request-signup-otp)
    ↓
Validate: Gmail only, Password complexity
    ↓
Generate OTP & Send Email
    ↓
Redirect to signup-otp.html
    ↓
[Enter 6-digit OTP]
    ↓
Verify Signup OTP (POST /verify-signup-otp)
    ↓
Create User in Database
    ↓
Generate JWT Token
    ↓
Redirect to Dashboard
```

### Password Reset Flow
```
Login Page → "Forgot Password"
    ↓
[Enter Gmail]
    ↓
Request Reset OTP (POST /forgot-password)
    ↓
Validate: Gmail only, User exists
    ↓
Generate OTP & Send Email
    ↓
Redirect to reset-password.html
    ↓
[Enter 6-digit OTP]
    ↓
Verify Reset OTP (POST /verify-reset-otp)
    ↓
Redirect to new-password.html
    ↓
[Enter New Password]
    ↓
Reset Password (POST /reset-password)
    ↓
Update Password in Database
    ↓
Redirect to Login
```

## Email Restrictions
- **Signup**: Gmail only (@gmail.com)
- **Password Reset**: Gmail only (@gmail.com)
- Pattern validation: `^[A-Za-z0-9.]+@gmail\.com$`

## OTP Specifications
- **Length**: 6 digits
- **Expiration**: 10 minutes (600 seconds)
- **Auto-delete**: MongoDB TTL index automatically deletes after expiration
- **Purpose tracking**: Distinguishes between 'signup' and 'password-reset'

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Only Gmail accounts are allowed" | Non-Gmail email | Use Gmail account |
| "Invalid or expired OTP" | Wrong OTP or > 10 min old | Request new OTP |
| "User with this email already exists" | Email already registered | Use different email or login |
| "No account found with this email" | Email not in database | Create new account |
| "Passwords do not match" | Password fields don't match | Re-enter passwords correctly |
| "OTP has expired" | Waited > 10 minutes | Click "Resend OTP" |

## Security Features
- OTPs automatically expire after 10 minutes
- OTPs are deleted after successful verification
- Failed verification attempts don't block the flow (users can resend)
- Passwords are hashed before storage (pre-save middleware in User model)
- JWT tokens for authentication
- Gmail-only restriction prevents spam

## Testing

### Test Signup Flow
```bash
1. Go to http://localhost:3000 or deployed URL
2. Click "Sign Up"
3. Fill form with Gmail account (e.g., test@gmail.com)
4. Submit form
5. Check email for 6-digit OTP
6. Enter OTP on verification page
7. Should see success message and redirect to dashboard
```

### Test Password Reset Flow
```bash
1. Go to login page
2. Click "Forgot Password"
3. Enter Gmail account
4. Check email for 6-digit OTP
5. Enter OTP on reset page
6. Enter new password
7. Should see success message and redirect to login
```

## Backward Compatibility
- Old `/auth/verify-otp` endpoint still works (redirects to `/auth/verify-signup-otp`)
- Old `/auth/resend-otp` endpoint still works (redirects to `/auth/resend-signup-otp`)
- Old `/auth/signup` endpoint redirects to use OTP flow

## Future Improvements
- [ ] Add rate limiting for OTP requests (prevent brute force)
- [ ] Add attempt limiting for OTP verification
- [ ] Send OTP via SMS as alternative to email
- [ ] OAuth integration (Google, GitHub)
- [ ] Multi-factor authentication (MFA)
- [ ] Remember device for 30 days

## Files Modified/Created

### Backend
- ✅ `backend/models/OTP.js` - Updated with purpose field
- ✅ `backend/services/otpService.js` - NEW unified OTP service
- ✅ `backend/routes/auth.js` - Updated to use OTP service

### Frontend
- ✅ `index.html` - No changes needed
- ✅ `script.js` - Updated signup to use request-signup-otp
- ✅ `signup-otp.html` - NEW OTP verification page for signup
- ✅ `signup-otp.js` - NEW OTP verification logic for signup
- ✅ `forgot-password.js` - Added email format validation
- ✅ `reset-password.js` - Already compatible
- ✅ `new-password.js` - Already compatible

## Deployment Notes
1. Update backend to use new OTP service
2. MongoDB TTL index on OTP collection must exist (auto-created on model)
3. Email service must be configured for sending OTPs
4. Frontend pages must reference correct API_URL from config.js
