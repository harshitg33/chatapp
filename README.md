# 💬 ChatApp — Real-Time Chat Application

A full-stack, production-ready real-time chat application built with **React**, **Node.js/Express**, **MongoDB**, **Socket.io**, and **JWT** authentication.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **JWT Auth** | Secure register/login with hashed passwords (bcrypt) |
| ⚡ **Real-time Messaging** | Instant delivery via Socket.io |
| 🟢 **Online/Offline Status** | Live presence indicators |
| ⌨️ **Typing Indicators** | See when the other person is typing |
| 🕐 **Message Timestamps** | Smart time formatting (today, yesterday, date) |
| 💾 **Chat History** | All messages persisted in MongoDB |
| 🔒 **Private Rooms** | Deterministic room IDs for private chats |
| 📱 **Responsive UI** | Works on desktop and mobile |

---

## 🗂️ Project Structure

```
chatapp/
├── backend/
│   ├── config/
│   │   └── socket.js          # Socket.io event handlers
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User MongoDB schema
│   │   └── Message.js         # Message MongoDB schema
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login, GET /me
│   │   ├── users.js           # GET /users
│   │   └── messages.js        # GET /messages/:userId
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Main entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Chat/
│       │   │   ├── Sidebar.js         # Users list panel
│       │   │   ├── ChatWindow.js      # Main chat area
│       │   │   ├── MessageBubble.js   # Individual message
│       │   │   └── MessageInput.js    # Input box + typing events
│       │   └── UI/
│       │       └── Avatar.js          # User avatar with initials
│       ├── context/
│       │   ├── AuthContext.js         # Global auth state
│       │   └── ChatContext.js         # Global chat state + socket events
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   └── ChatPage.js
│       ├── utils/
│       │   ├── api.js                 # Axios instance with JWT interceptor
│       │   └── socket.js             # Socket.io client singleton
│       ├── App.js                     # Router + providers
│       └── index.js
│
├── package.json                       # Root scripts with concurrently
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** running locally OR a [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- **npm** or **yarn**

---

### 1. Clone or Extract the Project

```bash
cd chatapp
```

### 2. Install All Dependencies

```bash
# From the root directory
npm run install:all
```

Or install separately:
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 3. Configure Environment Variables

**Backend** — copy and edit `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:3000
```

**Frontend** — copy and edit `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** — paste the connection string into `MONGO_URI`.

---

### 5. Run the Application

**Run both servers simultaneously (recommended):**
```bash
# From root directory
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login with credentials | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

**Register/Login Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all other users | ✅ |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/:userId` | Get chat history with a user | ✅ |

---

## 🗄️ MongoDB Schemas

### User Schema
```javascript
{
  username:  String (unique, 3–20 chars),
  email:     String (unique, valid email),
  password:  String (hashed with bcrypt, never returned),
  isOnline:  Boolean (default: false),
  lastSeen:  Date,
  socketId:  String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  roomId:    String (sorted "userId1_userId2"),
  sender:    ObjectId → User,
  receiver:  ObjectId → User,
  content:   String (max 2000 chars),
  isRead:    Boolean,
  createdAt: Date,  // ← message timestamp
  updatedAt: Date
}
```

---

## ⚡ Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ targetUserId }` | Join a private chat room |
| `message:send` | `{ receiverId, content }` | Send a message |
| `typing:start` | `{ targetUserId }` | Started typing |
| `typing:stop` | `{ targetUserId }` | Stopped typing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:receive` | `Message object` | New incoming message |
| `user:status` | `{ userId, isOnline, lastSeen }` | User online/offline change |
| `typing:start` | `{ userId, username }` | Someone started typing |
| `typing:stop` | `{ userId }` | Someone stopped typing |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds)
- JWT tokens expire after **7 days**
- Socket connections require **valid JWT** authentication
- Passwords are **never returned** in API responses (`select: false`)
- CORS restricted to configured `CLIENT_URL`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Context API |
| Styling | Pure CSS with CSS custom properties |
| Real-time | Socket.io Client v4 |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| Real-time Server | Socket.io v4 |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Dev Tools | Nodemon, Concurrently |
