# Real-Time Chat Backend

Production-ready Node.js + Express backend for a real-time chat application with MongoDB, JWT authentication, and Socket.io.

---

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection setup
│   └── config.js          # Centralized configuration management
├── controllers/
│   ├── authController.js  # User registration & login logic
│   ├── userController.js  # User list operations
│   └── messageController.js # Message send & retrieval logic
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   ├── errorHandler.js    # Centralized error handling
│   └── notFound.js        # 404 handler for undefined routes
├── models/
│   ├── User.js            # User schema with password hashing
│   └── Message.js         # Message schema with references
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── userRoutes.js      # User endpoints
│   └── messageRoutes.js   # Message endpoints
├── socket/
│   └── index.js           # Socket.io initialization & handlers
├── utils/
│   └── generateToken.js   # JWT token generation utility
├── server.js              # Express app entry point
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── .env                   # Actual environment variables (not in git)
```

---

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT signing

### 3. Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000` by default.

---

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "profilePic": "https://avatar-url.com/pic.jpg" (optional)
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://avatar-url.com/pic.jpg",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://avatar-url.com/pic.jpg",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Users

#### Get All Users (except logged-in user)
```
GET /api/users
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "user_id_1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profilePic": "https://avatar-url.com/pic.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

### Messages

#### Send Message
```
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "senderId": "user_id_1",
  "receiverId": "user_id_2",
  "text": "Hello, how are you?"
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "message_id",
    "senderId": "user_id_1",
    "receiverId": "user_id_2",
    "text": "Hello, how are you?",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Conversation Messages
```
GET /api/messages/:userId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "message_id",
      "senderId": {
        "_id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "receiverId": {
        "_id": "user_id_2",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "text": "Hello!",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

---

## Socket.io Events

### Client → Server

#### Join User Room
```javascript
socket.emit('join', userId);
```

#### Send Message
```javascript
socket.emit('newMessage', {
  senderId: string,
  receiverId: string,
  text: string,
  _id: string,
  createdAt: string
});
```

#### User Typing
```javascript
socket.emit('userTyping', {
  userId: string,
  receiverId: string
});
```

#### User Stopped Typing
```javascript
socket.emit('userStoppedTyping', {
  userId: string,
  receiverId: string
});
```

### Server → Client

#### Receive Message
```javascript
socket.on('message', (message) => {
  // Handle incoming message
  console.log(message);
});
```

#### User Online
```javascript
socket.on('userOnline', ({ userId, status }) => {
  // Update user online status
});
```

#### User Offline
```javascript
socket.on('userOffline', ({ userId, status }) => {
  // Update user offline status
});
```

#### User Typing Indicator
```javascript
socket.on('userTyping', ({ userId }) => {
  // Show typing indicator
});
```

---

## File Descriptions

### Config Files

**`config/db.js`**
- Establishes MongoDB connection using Mongoose
- Handles connection errors and retries

**`config/config.js`**
- Centralized environment variable management
- Validates required variables on startup

### Model Files

**`models/User.js`**
- User schema with email validation
- Password hashing via bcryptjs pre-save middleware
- `matchPassword()` method for authentication
- Default password exclusion from queries

**`models/Message.js`**
- Message schema with sender/receiver references
- Timestamps for audit trail
- Indexes for efficient conversation queries

### Middleware Files

**`middleware/auth.js`**
- Extracts and verifies JWT from Authorization header
- Attaches authenticated user to request object
- Protects private routes

**`middleware/errorHandler.js`**
- Global error handler (must be last middleware)
- Formats errors consistently
- Hides stack traces in production

**`middleware/notFound.js`**
- Handles requests to undefined routes
- Returns 404 status with helpful message

### Controller Files

**`controllers/authController.js`**
- `registerUser()` - Create new account
- `authUser()` - Authenticate and generate token

**`controllers/userController.js`**
- `getUsers()` - Retrieve all users except logged-in user

**`controllers/messageController.js`**
- `sendMessage()` - Create and store message
- `getMessages()` - Retrieve conversation between two users

### Route Files

Route files map HTTP requests to controller methods. All message and user routes are protected with JWT authentication.

### Socket File

**`socket/index.js`**
- Initializes Socket.io server
- Manages real-time connections
- Handles message delivery and typing indicators
- Broadcast user online/offline status

---

## Authentication Flow

1. **Register** - User creates account with email/password
2. **Login** - User provides credentials, receives JWT token
3. **API Requests** - Include `Authorization: Bearer <token>` header
4. **JWT Verification** - `auth` middleware extracts and verifies token
5. **Protected Access** - Request proceeds if token is valid

---

## Error Handling

All errors are caught by `express-async-handler` and passed to the centralized error middleware. Responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Only in development mode"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Resource created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `409` - Conflict (duplicate email)
- `500` - Server error

---

## Security Best Practices

✓ Passwords hashed with bcryptjs (10 salt rounds)
✓ JWT secrets stored in environment variables
✓ Password fields excluded from queries
✓ CORS configured for frontend origin
✓ No sensitive data in error messages
✓ Stack traces hidden in production
✓ Validation on all inputs

---

## Performance Optimizations

✓ MongoDB indexes on frequently queried fields
✓ `select('-password')` to exclude sensitive fields
✓ Socket.io rooms for targeted message delivery
✓ Connection pooling via Mongoose

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to strong random value
- [ ] Configure `MONGO_URI` for production database
- [ ] Set `CORS_ORIGIN` to frontend domain
- [ ] Enable HTTPS in production
- [ ] Setup environment variables on hosting platform
- [ ] Run `npm install --production`
- [ ] Test all API endpoints
- [ ] Monitor logs for errors

---

## Dependencies

See `package.json` for complete list. Main packages:
- `express` - HTTP server framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT creation/verification
- `bcryptjs` - Password hashing
- `socket.io` - Real-time communication
- `cors` - Cross-origin request handling
- `dotenv` - Environment variable management
- `express-async-handler` - Error handling for async functions
- `nodemon` - Auto-restart on file changes (dev)

---

## Troubleshooting

**MongoDB Connection Fails**
- Verify MONGO_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**JWT Errors**
- Verify JWT_SECRET matches between signup/login
- Check token format (must include "Bearer " prefix)
- Token may be expired (30 days default)

**Socket.io Connection Issues**
- Verify CORS_ORIGIN matches frontend URL
- Check browser console for connection errors
- Ensure socket events use correct payload structure

---

## Future Enhancements

- [ ] Message read receipts
- [ ] User typing indicators
- [ ] Group chat support
- [ ] File/image sharing
- [ ] Message search
- [ ] User blocking
- [ ] Voice/video calls
- [ ] Message encryption

---

## License

MIT

