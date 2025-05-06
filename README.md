# 🧾 Dm2buy Snippet App

A fullstack MERN-based real-time code snippet manager with collaborative editing, built with **React 19**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---

## 🚀 Setup and Installation Instructions

### 1. Clone the Repository
```bash
https://github.com/your-username/dm2buy-snippet-app.git
cd dm2buy-snippet-app
```

### 2. Backend Setup (Express + MongoDB)
```bash
cd server
npm install

# Create a .env file with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/dm2buy_snippets
JWT_SECRET=your_jwt_secret

npm run dev
```

### 3. Frontend Setup (React 19 with Next.js)
```bash
cd client
npm install
npm run dev
```

Ensure MongoDB is running locally. The app will be available at `http://localhost:3000`.

---

## ✨ Feature Overview and Usage Instructions

### 🔐 Authentication
- Register/Login with JWT authentication.
- Protected routes with access control.

### 🧩 Snippet Management
- Create, read, update, delete (CRUD) code snippets.
- Search through personal snippet library.

### 🧠 Real-time Collaboration
- Join collaborative editing sessions.
- Code updates broadcast live via WebSocket (Socket.IO).
- Optimistic UI updates for faster feedback.

### 🗃️ Collections and Sharing
- Organize snippets into collections (folders).
- Share with team members and control edit permissions.

### 🧪 Code Execution (Bonus)
- Execute JavaScript code securely in a sandbox.
- Display result and console output.

### 🧑‍💻 Languages Supported
- JavaScript
- Python
- HTML
- CSS
- C++

---

## ⚙️ Technical Approach and Key Implementation Decisions

### ✅ Stack
- **Frontend**: React 19 (Next.js), TailwindCSS, `@monaco-editor/react`
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Realtime**: Socket.IO

### 🧱 Key Design Decisions
- **Monaco Editor** was used for a powerful, VSCode-like editing experience.
- Used **Socket.IO rooms** for per-snippet collaboration.
- **JWT tokens** handle authentication and protect backend routes.
- Database schema relationships via Mongoose populate allow efficient querying and permissions.

---

## ⚠️ Challenges Faced and Solutions Implemented

### 1. Real-Time Sync Conflicts
**Issue**: Multiple users typing simultaneously could overwrite each other’s code.
**Solution**: Used Socket.IO + debouncing + room broadcasting to merge updates without excessive conflicts.

### 2. Optimistic UI with Delays
**Issue**: Waiting for server responses caused sluggish UI.
**Solution**: Used optimistic state updates — update UI first, then confirm with server.

### 3. Secure Code Execution
**Issue**: Executing untrusted code safely.
**Solution**: Used `vm2` sandbox to execute JavaScript in a controlled environment.

### 4. Session Reconnection
**Issue**: User lost connection and missed edits.
**Solution**: On reconnect, server sends latest snippet state to the reconnecting client.

---

## 📂 Project Structure (Simplified)
```
dm2buy-snippet-app/
├── client/         # React 19 (Next.js) frontend
├── server/         # Express + MongoDB backend
├── README.md
```

---

## 📌 Future Enhancements
- Add cursor tracking and user presence indicators.
- Improve collaboration engine with CRDT or OT.
- Support more languages and collections filtering.

---

## 👨‍💻 Developed By
[Your Name / GitHub handle]
