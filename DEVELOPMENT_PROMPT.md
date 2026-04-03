# Real-Time Chat Application - Architecture & Development Prompt

## Project Overview
We are building a **production-ready, research-oriented real-time chat application** with advanced features including group messaging, conversation intelligence, file sharing, and screen sharing capabilities.

**Current Status**: Backend core is complete with JWT authentication, MongoDB models, and Socket.io. Now ready to implement advanced features.

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **File Handling**: Multer + Sharp (for image optimization)
- **API Documentation**: RESTful with JSON responses

### Frontend
- React.js
- Tailwind CSS
- Socket.io Client
- (Details to be defined)

---

## Core Backend Implementation (Completed)

### Existing Models
```
User.js
├── name (required)
├── email (unique, required)
├── password (hashed with bcrypt)
├── profilePic (optional)
└── timestamps

Message.js
├── senderId (ObjectId ref User)
├── receiverId (ObjectId ref User)
├── text (required)
└── timestamps
```

### Existing Controllers
- `authController.js` - Register, Login
- `userController.js` - Get all users
- `messageController.js` - Send/Get messages

### Existing Routes & Socket Events
- `/api/auth/register` - POST
- `/api/auth/login` - POST
- `/api/users` - GET (protected)
- `/api/messages` - POST, GET (protected)
- Socket events: `join`, `newMessage`, `disconnect`

---

## Planned Features (High Priority)

### 1. Group Chat
**Purpose**: Enable multi-user conversations with granular member management.

**Database Models**:
```javascript
Group.js
├── name: String (required)
├── description: String (optional)
├── members: [ObjectId] (array of User refs)
├── createdBy: ObjectId (User ref)
├── profilePic: String (optional)
├── isActive: Boolean (default: true)
└── timestamps

GroupMessage.js
├── groupId: ObjectId (Group ref)
├── senderId: ObjectId (User ref)
├── text: String (required)
├── attachments: [ObjectId] (File refs - optional)
├── isEdited: Boolean (default: false)
├── editedAt: Date (optional)
├── isDeleted: Boolean (default: false)
└── timestamps
```

**API Endpoints**:
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `PUT /api/groups/:groupId` - Update group info
- `POST /api/groups/:groupId/members` - Add member
- `DELETE /api/groups/:groupId/members/:userId` - Remove member
- `DELETE /api/groups/:groupId` - Delete group
- `POST /api/groups/:groupId/leave` - Leave group

**Socket Events**:
- `joinGroup(groupId, userId)` - User joins group room
- `leaveGroup(groupId, userId)` - User leaves group room
- `newGroupMessage(groupId, message)` - Broadcast to group
- `memberAdded(groupId, userId)` - Notify new member
- `memberRemoved(groupId, userId)` - Notify removed member
- `groupUpdated(groupId, data)` - Broadcast group info changes

---

### 2. Message Edit & Delete
**Purpose**: Allow users to modify or remove sent messages.

**Model Changes**:
```javascript
Message.js modifications:
├── text: String (now editable)
├── isEdited: Boolean (default: false)
├── editedAt: Date (optional)
├── isDeleted: Boolean (default: false - soft delete)
└── deletedAt: Date (optional)

GroupMessage.js modifications:
├── Same fields as above
```

**API Endpoints**:
- `PUT /api/messages/:messageId` - Edit message (protected, only sender)
- `DELETE /api/messages/:messageId` - Delete message (protected, only sender)
- `PUT /api/groups/:groupId/messages/:messageId` - Edit group message
- `DELETE /api/groups/:groupId/messages/:messageId` - Delete group message

**Validation**:
- Only message sender can edit/delete
- Cannot edit/delete after 24 hours (optional business rule)
- Soft delete: preserve message for audit trail

**Socket Events**:
- `messageEdited(messageId, newText, editedAt)` - Broadcast to receiver
- `messageDeleted(messageId)` - Broadcast deletion
- `groupMessageEdited(groupId, messageId, newText)` - Broadcast to group
- `groupMessageDeleted(groupId, messageId)` - Broadcast to group

---

### 3. Message Reactions (Emoji)
**Purpose**: Allow users to react to messages with emojis.

**Database Model**:
```javascript
Reaction.js
├── messageId: ObjectId (Message ref)
├── userId: ObjectId (User ref)
├── emoji: String (e.g., "👍", "❤️", "😂", "🔥", "😢")
└── timestamps

Supported emojis: 👍 ❤️ 😂 😲 😢 🔥 👏 🙏
```

**API Endpoints**:
- `POST /api/messages/:messageId/reactions` - Add reaction
  - Body: `{ emoji: "👍" }`
- `DELETE /api/messages/:messageId/reactions/:emoji` - Remove reaction
- `GET /api/messages/:messageId/reactions` - Get all reactions on message

**Business Logic**:
- One emoji per user per message
- Adding same emoji again removes it (toggle)
- Return list of users who reacted with each emoji

**Socket Events**:
- `messageReactionAdded(messageId, emoji, userId)` - Broadcast
- `messageReactionRemoved(messageId, emoji, userId)` - Broadcast

---

### 4. File/Image Sharing (Max 10MB)
**Purpose**: Enable users to share images, documents, and videos.

**Constraints**:
- Maximum file size: 10MB per file
- Supported types:
  - Images: jpeg, png, gif, webp, svg
  - Documents: pdf, doc, docx, txt, xls, xlsx
  - Videos: mp4, webm, mov (optional)
- Virus scanning: Optional (ClamAV integration)
- Storage: Local disk or AWS S3/Cloudinary

**Database Model**:
```javascript
File.js
├── messageId: ObjectId (Message ref)
├── uploadedBy: ObjectId (User ref)
├── fileName: String
├── fileSize: Number (bytes)
├── mimeType: String
├── url: String (public accessible URL)
├── thumbnail: String (for images)
├── metadata: Object {
│   ├── width: Number (for images)
│   ├── height: Number (for images)
│   └── duration: Number (for videos)
├── uploadedAt: Date
├── expiresAt: Date (optional - auto-delete after 30 days)
└── isScanned: Boolean (virus scan status)
```

**Message Model Changes**:
```javascript
Message.js modifications:
├── text: String (now optional if attachment exists)
├── attachments: [ObjectId] (File refs)
```

**API Endpoints**:
- `POST /api/files/upload` - Upload file
  - Multipart form: file + messageId
  - Returns: File object with URL
- `GET /api/files/:fileId` - Download/preview file
- `DELETE /api/files/:fileId` - Delete file (only uploader)
- `POST /api/messages/:messageId/attachments` - Attach to message

**Validation**:
- File size < 10MB
- Mime type whitelist validation
- Virus scan before storing
- Filename sanitization (prevent directory traversal)

**Socket Events**:
- `fileUploaded(messageId, file)` - Broadcast file info

**Storage Options**:
1. **Local**: `/backend/uploads/` with public URL
2. **S3**: AWS bucket with signed URLs
3. **Cloudinary**: CDN delivery with transformations

---

### 5. Link Previews
**Purpose**: Display rich preview cards for URLs in messages.

**Database Model**:
```javascript
LinkPreview.js
├── url: String (unique)
├── title: String
├── description: String
├── image: String (og:image)
├── favicon: String
├── domain: String
├── siteType: String (website, article, video, etc)
├── cachedAt: Date
└── expiresAt: Date (cache for 30 days)
```

**Message Model Changes**:
```javascript
Message.js modifications:
├── linkPreviews: [Object] {
│   ├── url: String
│   ├── preview: ObjectId (LinkPreview ref)
├── }
```

**Logic**:
1. Detect URLs in message text (regex pattern)
2. Extract metadata (title, description, image)
3. Cache results to avoid redundant fetches
4. Return preview data with message

**API Endpoints** (optional, used by frontend):
- `POST /api/previews/generate` - Manually generate preview
  - Body: `{ url: "https://..." }`

**Socket Events**:
- `linkPreviewGenerated(messageId, preview)` - Broadcast preview data

**Implementation Stack**:
- Library: `open-graph-scraper`, `cheerio`, `node-fetch`
- Timeout: 5 seconds per URL
- Fallback: Show plain URL if fetch fails
- Caching: Redis or MongoDB

---

### 6. Dark Mode
**Purpose**: User interface theme preference.

**Database Model**:
```javascript
UserPreference.js
├── userId: ObjectId (User ref, unique)
├── theme: String (enum: "light", "dark", "system")
├── fontSize: String (enum: "small", "medium", "large")
├── notifications: Boolean
├── sound: Boolean
├── compactMode: Boolean
└── updatedAt: Date
```

**API Endpoints**:
- `GET /api/users/:userId/preferences` - Get preferences
- `PUT /api/users/:userId/preferences` - Update preferences
  - Body: `{ theme: "dark", fontSize: "medium" }`

**Frontend Implementation**:
- Detect system theme: `prefers-color-scheme`
- Store in localStorage
- CSS variables for theme colors
- Tailwind dark mode with `dark:` prefix

---

### 7. Conversation Intelligence (NLP)
**Purpose**: Extract insights from conversations (research-oriented).

**Database Model**:
```javascript
ConversationAnalytics.js
├── conversationId: String (between two users or groupId)
├── conversationType: String (enum: "direct", "group")
├── sentiment: Object {
│   ├── positive: Number (%)
│   ├── negative: Number (%)
│   ├── neutral: Number (%)
├── }
├── topics: [Object] {
│   ├── name: String
│   ├── frequency: Number
│   ├── confidence: Number (0-1)
├── }
├── keywords: [Object] {
│   ├── word: String
│   ├── frequency: Number
├── }
├── summary: String (1-2 sentences)
├── engagement_score: Number (0-100)
├── messageCount: Number
├── responseTime_avg: Number (milliseconds)
├── silentPeriods: [Object] {
│   ├── start: Date
│   ├── duration: Number (hours)
├── }
├── participantCount: Number
├── analyzedAt: Date
└── updatedAt: Date
```

**NLP Features**:
1. **Sentiment Analysis**: Classify each message as positive/negative/neutral
   - Library: `natural`, `sentiment`
   - Per-message scores aggregated to conversation level
   
2. **Topic Extraction**: Extract main topics from conversation
   - Library: `natural`, `compromise`
   - Keywords with frequency scores
   
3. **Conversation Summary**: One-liner summary of discussion
   - Extract key sentences from conversation
   - Combine using extractive summarization
   
4. **Engagement Metrics**:
   - Message frequency per hour
   - Response time patterns
   - Silent periods (no messages for X hours)
   
5. **Keyword Extraction**: Most important terms in conversation
   - TF-IDF or frequency-based

**API Endpoints**:
- `GET /api/analytics/conversations/:conversationId` - Get full analytics
- `GET /api/analytics/conversations/:conversationId/summary` - Get summary only
- `GET /api/analytics/conversations/:conversationId/sentiment` - Get sentiment trend
- `GET /api/analytics/conversations/:conversationId/topics` - Get topics

**Processing**:
- Asynchronous: Analyze messages after they're stored
- Batch processing: Update analytics every 10 messages or hourly
- Cache results: Store in database to avoid re-computation
- Privacy: Summarize text at conversation level, not individual messages

**Libraries**:
```
npm install natural sentiment compromise axios cheerio
```

---

### 8. Screen Share (WebRTC)
**Purpose**: Enable real-time screen sharing during conversations.

**Database Model** (optional, for analytics):
```javascript
ScreenShareSession.js
├── userId: ObjectId (User ref)
├── conversationType: String (enum: "direct", "group")
├── conversationId: String
├── startTime: Date
├── endTime: Date (optional)
├── duration: Number (seconds)
├── streamMetadata: Object {
│   ├── width: Number
│   ├── height: Number
│   ├── frameRate: Number
│   ├── bandwidth: Number
├── }
└── status: String (enum: "active", "ended", "failed")
```

**Socket Events**:
- `requestScreenShare(userId)` - Request permission to share screen
- `screenShareStarted({ streamId, userId, resolution })` - Notify peer(s)
- `screenShareStopped(userId)` - End screen share
- `screenShareEnded()` - Acknowledge stop

**WebRTC Implementation**:
- `navigator.mediaDevices.getDisplayMedia()`
- PeerConnection using `video` track
- Constraints: HD resolution, 30 FPS
- Fallback: Ask for permission again if denied
- Peer: Receive stream from `ontrack` event

**Frontend Stack**:
- WebRTC library: `simple-peer` or native PeerConnection
- Video element: `<video autoPlay muted={true} />`

**Constraints**:
- One screen share per conversation at a time
- Browser support check (Chrome, Firefox, Edge, Safari 13+)
- Permission prompts for screen access
- Stop button to end sharing

---

## Modular Architecture

### Directory Structure
```
backend/
├── config/
│   ├── db.js
│   └── config.js
├── controllers/
│   ├── authController.js
│   ├── messageController.js (enhanced)
│   ├── groupController.js (NEW)
│   ├── groupMessageController.js (NEW)
│   ├── reactionController.js (NEW)
│   └── analyticsController.js (NEW)
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/
│   ├── User.js
│   ├── Message.js (enhanced)
│   ├── Group.js (NEW)
│   ├── GroupMessage.js (NEW)
│   ├── Reaction.js (NEW)
│   ├── File.js (NEW)
│   ├── LinkPreview.js (NEW)
│   ├── ConversationAnalytics.js (NEW)
│   └── UserPreference.js (NEW)
├── modules/
│   ├── fileUpload/
│   │   ├── fileController.js
│   │   ├── fileValidator.js
│   │   ├── fileOptimizer.js
│   │   └── fileStorage.js
│   ├── linkPreview/
│   │   ├── previewController.js
│   │   ├── previewValidator.js
│   │   └── previewParser.js
│   ├── nlp/
│   │   ├── sentimentAnalyzer.js
│   │   ├── topicExtractor.js
│   │   ├── keywordExtractor.js
│   │   ├── conversationSummary.js
│   │   └── conversationMetrics.js
│   └── screenShare/
│       ├── screenShareController.js
│       ├── screenShareValidator.js
│       └── screenShareMetrics.js
├── routes/
│   ├── authRoutes.js
│   ├── messageRoutes.js (enhanced)
│   ├── groupRoutes.js (NEW)
│   ├── reactionRoutes.js (NEW)
│   ├── fileRoutes.js (NEW)
│   ├── preferencesRoutes.js (NEW)
│   ├── analyticsRoutes.js (NEW)
│   └── screenShareRoutes.js (NEW)
├── socket/
│   ├── index.js (enhanced)
│   ├── messageEvents.js (enhanced)
│   ├── groupEvents.js (NEW)
│   ├── reactionEvents.js (NEW)
│   ├── fileEvents.js (NEW)
│   ├── screenShareEvents.js (NEW)
│   └── analyticsEvents.js (NEW)
├── utils/
│   ├── constants.js
│   ├── validators.js
│   ├── generateToken.js
│   └── logger.js (NEW)
├── server.js (enhanced)
├── .env.example
├── package.json (updated)
└── README.md
```

---

## Database Schema Relationships

```
User
├── 1 → ∞ Message (senderId)
├── 1 → ∞ Reaction (userId)
├── 1 → ∞ Group (createdBy)
├── ∞ ← ∞ Group (members array)
└── 1 → 1 UserPreference

Message
├── 1 ← Group (belongs to either direct or group)
├── ∞ → Reaction
├── ∞ → File (attachments)
└── ∞ → LinkPreview

Group
├── 1 → ∞ GroupMessage
└── ∞ → User (members array)

GroupMessage
├── ∞ → Reaction
└── ∞ → File (attachments)

Reaction
├── 1 ← Message OR GroupMessage
└── 1 ← User

File
├── 1 ← Message OR GroupMessage
└── 1 ← User (uploadedBy)

LinkPreview
├── 1 ← Message

ConversationAnalytics
├── 1 ← Message OR GroupMessage

ScreenShareSession
├── 1 ← User
└── 1 ← Conversation (direct or group)
```

---

## Implementation Roadmap

### Phase 1: Foundations (Week 1)
1. Message Edit & Delete - simplest, high value
2. Message Reactions - builds on Phase 1
3. Database indexes for performance

### Phase 2: Media & Sharing (Week 2)
4. File/Image Upload with validation
5. Link Preview extraction & caching
6. Update message routes for attachments

### Phase 3: Group Features (Week 3)
7. Group Chat models & controllers
8. Group message routes & socket events
9. Member management endpoints

### Phase 4: Research Features (Week 4)
10. NLP sentiment analysis integration
11. Topic & keyword extraction
12. Conversation analytics API
13. Async analytics processing pipeline

### Phase 5: Advanced Real-time (Week 5)
14. Screen share WebRTC setup
15. User preferences & dark mode
16. Performance optimization & caching

### Phase 6: Polish & Deployment (Week 6)
17. Error handling across all features
18. Input validation everywhere
19. API documentation
20. Load testing & optimization

---

## Environment Variables Required

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
STORAGE_TYPE=local # local | s3 | cloudinary

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Cloudinary (if using)
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# NLP Processing
NLP_BATCH_SIZE=50
NLP_PROCESS_INTERVAL=600000 # 10 minutes

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

---

## NPM Dependencies to Add

```json
{
  "dependencies": {
    "multer": "^1.4.5",
    "sharp": "^0.33.0",
    "open-graph-scraper": "^6.2.0",
    "cheerio": "^1.0.0-rc.12",
    "natural": "^6.10.0",
    "sentiment": "^1.1.1",
    "compromise": "^14.10.0",
    "axios": "^1.6.0",
    "express-async-handler": "^1.2.0",
    "redis": "^4.6.0"
  }
}
```

---

## API Response Format (Standardized)

```javascript
// Success Response
{
  "success": true,
  "data": {
    // response data
  },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error description",
  "details": "Additional error context"
}

// List Response with Pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Testing Priorities

1. **Unit Tests**: Controllers, validators, NLP functions
2. **Integration Tests**: Full API flows (upload → message → reaction)
3. **Socket Tests**: Real-time event delivery
4. **Load Tests**: File upload performance, NLP processing speed
5. **Security Tests**: File upload validation, XSS in message text

---

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] File upload: Size limits, MIME type validation, filename sanitization
- [ ] Link preview: URL validation, timeout handling, no sensitive headers
- [ ] NLP: Handle malicious text patterns
- [ ] Rate limiting: Prevent spam uploads/API calls
- [ ] CORS: Whitelist frontend origin
- [ ] JWT: Secure secret, token expiration
- [ ] File storage: No public write access, signed URLs for downloads
- [ ] Virus scanning: Optional ClamAV for file safety
- [ ] Error messages: No sensitive info in responses

---

## Performance Optimization

1. **Database**: Indexes on frequently queried fields
2. **Caching**: Redis for link previews, user preferences
3. **File Storage**: CDN for distributed delivery
4. **WebRTC**: Adaptive bitrate for screen share
5. **NLP**: Batch processing, asynchronous analysis
6. **Message Pagination**: Load 20 messages per request

---

## Questions for Development Team

1. Where should files be stored? (Local, S3, Cloudinary?)
2. How long to cache link previews? (30 days default)
3. Run NLP analysis in real-time or batch? (Recommend batch)
4. Should old messages be soft-deleted or hard-deleted?
5. Maximum group size limit?
6. Virus scanning required for files?

---

## References & Standards

- **Socket.io**: https://socket.io/docs/
- **WebRTC**: https://webrtc.org/
- **Open Graph**: https://ogp.me/
- **NLP Libraries**: https://github.com/NaturalNode/natural
- **Multer**: https://github.com/expressjs/multer
- **Sharp**: https://sharp.pixelplumbing.com/

---

## Summary

This prompt defines a comprehensive, modular real-time chat system with:
- ✅ Core authentication & messaging (complete)
- 🔄 8 advanced features (planned, with architecture)
- 📦 Clear modular structure
- 🗄 Database relationships mapped
- 🛣 API endpoints specified
- ⚡ Socket.io events documented
- 🔐 Security considerations
- 📈 Performance optimizations
- 📅 Implementation roadmap

Ready for development implementation phases.
