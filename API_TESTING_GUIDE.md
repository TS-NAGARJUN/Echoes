# API Testing Guide - Backend Response Validation

**Date**: April 1, 2026  
**Backend Status**: ✅ Running on http://localhost:5000

---

## 📌 Important Notes

- All protected endpoints require `Authorization: Bearer {token}` header
- Replace `{token}` with actual JWT from login/register response
- Replace `{messageId}` with actual message ID from database
- Replace `{userId}` with actual user ID
- Test in order: **Register → Login → Protected Endpoints**

---

## 🔐 Step 1: Register User

### Request
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "profilePic": "https://example.com/pic.jpg"
  }'
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://example.com/pic.jpg",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxMjAxMjM0NSwiZXhwIjoxNzE5Nzg4MzQ1fQ.abc123"
  }
}
```

### ✅ Success Criteria
- Status code: **201**
- `success: true`
- Token is provided (use for next requests)
- User ID is returned

---

## 🔑 Step 2: Login User

### Request
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://example.com/pic.jpg",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxMjAxMjM0NSwiZXhwIjoxNzE5Nzg4MzQ1fQ.abc123"
  }
}
```

### ✅ Success Criteria
- Status code: **200**
- `success: true`
- Same token as registration (30 days expiry)
- User profile data matches

---

## 👥 Step 3: Get All Users (Protected)

### Request
```bash
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxMjAxMjM0NSwiZXhwIjoxNzE5Nzg4MzQ1fQ.abc123"

curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $token"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePic": "https://example.com/pic.jpg",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profilePic": null,
      "createdAt": "2026-04-01T10:05:00.000Z",
      "updatedAt": "2026-04-01T10:05:00.000Z"
    }
  ]
}
```

### ✅ Success Criteria
- Status code: **200**
- `success: true`
- Returns array of all users (excludes password)
- Includes `count` of users

---

## 💬 Step 4: Send Message (Protected)

**Prerequisites**: 
- You need another registered user ID (from Step 3)
- Use `receiverId` for one of the users from the list

### Request
```bash
$token = "YOUR_TOKEN_HERE"
$receiverId = "507f1f77bcf86cd799439012"

curl -X POST "http://localhost:5000/api/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "text": "Hello, how are you?",
    "receiverId": "'$receiverId'"
  }'
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439013",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "text": "Hello, how are you?",
    "isEdited": false,
    "editedAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-01T10:10:00.000Z",
    "updatedAt": "2026-04-01T10:10:00.000Z"
  }
}
```

### ✅ Success Criteria
- Status code: **201**
- `success: true`
- Message ID is generated
- Timestamps are created
- `isEdited: false`, `isDeleted: false` (initial state)

---

## 📩 Step 5: Get Messages (Protected)

### Request
```bash
$token = "YOUR_TOKEN_HERE"

curl -X GET "http://localhost:5000/api/messages" \
  -H "Authorization: Bearer $token"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439013",
      "senderId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "receiverId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "text": "Hello, how are you?",
      "isEdited": false,
      "editedAt": null,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-04-01T10:10:00.000Z",
      "updatedAt": "2026-04-01T10:10:00.000Z"
    }
  ]
}
```

### ✅ Success Criteria
- Status code: **200**
- `success: true`
- Returns all non-deleted messages
- `senderId` and `receiverId` are populated with user details
- `count` matches number of messages

---

## ✏️ Step 6: Edit Message (Protected)

**Prerequisites**:
- Use message ID from Step 4 or 5

### Request
```bash
$token = "YOUR_TOKEN_HERE"
$messageId = "607f1f77bcf86cd799439013"

curl -X PUT "http://localhost:5000/api/messages/$messageId" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "text": "Hello, how are you doing today?"
  }'
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439013",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "text": "Hello, how are you doing today?",
    "isEdited": true,
    "editedAt": "2026-04-01T10:15:00.000Z",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-01T10:10:00.000Z",
    "updatedAt": "2026-04-01T10:15:00.000Z"
  }
}
```

### ✅ Success Criteria
- Status code: **200**
- `success: true`
- Text is updated
- `isEdited: true` (marked as edited)
- `editedAt` timestamp is set
- `updatedAt` reflects the edit time

---

## 🗑️ Step 7: Delete Message (Protected)

**Soft Delete** - Message remains in database but marked as deleted

### Request
```bash
$token = "YOUR_TOKEN_HERE"
$messageId = "607f1f77bcf86cd799439013"

curl -X DELETE "http://localhost:5000/api/messages/$messageId" \
  -H "Authorization: Bearer $token"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439013",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "text": "Hello, how are you doing today?",
    "isEdited": true,
    "editedAt": "2026-04-01T10:15:00.000Z",
    "isDeleted": true,
    "deletedAt": "2026-04-01T10:20:00.000Z",
    "createdAt": "2026-04-01T10:10:00.000Z",
    "updatedAt": "2026-04-01T10:20:00.000Z"
  }
}
```

### ✅ Success Criteria
- Status code: **200**
- `success: true`
- `isDeleted: true` (soft delete flag set)
- `deletedAt` timestamp is set
- Message still exists in database (for audit trail)

---

## ❌ Error Scenarios to Test

### 1. Missing Token
```bash
curl -X GET "http://localhost:5000/api/users"
```
**Expected**: 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided in Authorization header"
}
```

### 2. Invalid Token
```bash
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer invalid_token"
```
**Expected**: 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 3. Duplicate Email Registration
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate User",
    "email": "john@example.com",
    "password": "password123"
  }'
```
**Expected**: 409 Conflict
```json
{
  "success": false,
  "message": "User already registered with john@example.com"
}
```

### 4. Invalid Password (too short)
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Short Pass",
    "email": "short@example.com",
    "password": "123"
  }'
```
**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

### 5. Wrong Password Login
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```
**Expected**: 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 6. Missing Required Fields
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```
**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

---

## 🛠️ Testing Tools Recommended

### Option 1: Postman (GUI)
1. Download: https://www.postman.com/downloads/
2. Create collection with requests above
3. Use variables for token and IDs
4. Export for team sharing

### Option 2: REST Client VS Code Extension
1. Install: REST Client extension
2. Create `.http` file with requests
3. Click "Send Request" above each request

### Option 3: PowerShell wt (Built-in)
```powershell
# Test command directly in terminal
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    name="Test User"
    email="test@example.com"
    password="test123"
  } | ConvertTo-Json)

$response.Content | ConvertFrom-Json
```

---

## 📊 Testing Checklist

- [ ] Register User - Get token
- [ ] Login User - Verify same token
- [ ] Get Users - All users listed
- [ ] Send Message - Message created
- [ ] Get Messages - Message retrieved with populated sender/receiver
- [ ] Edit Message - isEdited=true, text updated
- [ ] Delete Message - isDeleted=true, soft delete confirmed
- [ ] Test without token - 401 error
- [ ] Test with invalid token - 401 error
- [ ] Test duplicate email - 409 error
- [ ] Test short password - 400 error

---

## 📝 Response Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST (user/message created) |
| 400 | Bad Request | Missing fields, validation errors |
| 401 | Unauthorized | Missing/invalid token, wrong password |
| 404 | Not Found | Message ID doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Database connection issues |

---

## 🚀 Next Steps

1. ✅ Test all endpoints above
2. Document actual responses
3. Verify status codes match expected
4. Check error messages are clear
5. Ready for frontend integration

**Status**: Ready for comprehensive backend testing
