# 💬 Bubble Meet — Real-Time Chat Application
<img width="1917" height="911" alt="Screenshot 2026-10-04 232302" src="https://github.com/user-attachments/assets/06bfaeec-9b04-4571-87ec-692e32ebafa0" />


Bubble Meet is a **real-time chat application** built with modern web technologies. It allows users to communicate instantly through a clean and responsive interface with real-time message delivery.

The project is designed as a full-stack application to demonstrate **React.js, Node.js, Express.js, MongoDB, REST APIs, authentication, and real-time communication**.
<img width="1876" height="891" alt="Screenshot 2026-10-04 232314" src="https://github.com/user-attachments/assets/46766ba5-4bc9-41d2-9611-27d059a4c9a8" />

## 🚀 Features

* 🔐 User Authentication
* 👤 User Registration & Login
* 💬 Real-Time One-to-One Messaging
* ⚡ Instant Message Delivery
* 🟢 Online/Offline User Status
* 📱 Responsive Design
* 🔍 User Search
* 🗂️ Chat Management
* 🔒 Protected Routes
* 🌐 REST API Integration
* ⚡ Real-Time Communication using Socket.IO
* 🗄️ MongoDB Database
* 🛡️ Secure Backend Architecture

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js
* Socket.IO
* REST APIs
* JWT Authentication

### Database

* MongoDB
* Mongoose

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* npm
<img width="1873" height="900" alt="Screenshot 2026-10-04 232336" src="https://github.com/user-attachments/assets/61c33af0-87e5-4eca-9c3f-fc9dc61815d2" />

## 📁 Project Structure

```text
Bubble-Meet_Real-Time-Chat-Application/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── assets/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── socket/
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

> The exact folder structure may vary depending on the implementation.

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/HarshKumar246735/Bubble-Meet_Real_Time_Chat_Application.git
```

Navigate into the project:

```bash
cd Bubble-Meet_Real_Time_Chat_Application
```

## 2. Install Dependencies

### Install Client Dependencies

```bash
cd client
npm install
```

### Install Server Dependencies

Open another terminal or navigate back to the root:

```bash
cd ../server
npm install
```

## 3. Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Do not upload your `.env` file to GitHub.

## 4. Run the Application

### Start Backend

```bash
cd server
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

## 🔄 How It Works

```text
User
  │
  ▼
React Frontend
  │
  ├── REST API ───────► Express + Node.js
  │                         │
  │                         ▼
  │                      MongoDB
  │
  └── Socket.IO ──────► Real-Time Server
                            │
                            ▼
                       Other Users
```

When a user sends a message:

1. The message is created from the React frontend.
2. The frontend communicates with the backend.
3. The server processes the message.
4. The message is stored in MongoDB.
5. Socket.IO sends the message to the connected recipient.
6. The recipient receives the message instantly without refreshing the page.

## 🔐 Authentication

Bubble Meet uses authentication to protect user accounts and application resources.

The authentication flow includes:

```text
Register
   ↓
Login
   ↓
JWT Token
   ↓
Authenticated Requests
   ↓
Protected Resources
```

Passwords should be securely hashed before being stored in the database.

## ⚡ Real-Time Communication

The application uses **Socket.IO** for real-time communication.

This enables features such as:

* Instant messaging
* Online user status
* Real-time message updates
* Communication without page refresh

## 🧪 API Testing

You can use **Postman** to test the backend APIs.

Example API categories:

```text
Authentication
├── Register
└── Login

Users
├── Get Users
└── Get User Profile

Messages
├── Send Message
├── Get Conversations
└── Get Chat Messages
```

## 🔒 Security Practices

The project follows basic web application security practices such as:

* JWT-based authentication
* Protected API routes
* Password hashing
* Environment variables for sensitive information
* Input validation
* Authentication middleware
* CORS configuration

## 📸 Screenshots

Add screenshots of your application here after completing the UI.

Example:

```text
screenshots/
├── login.png
├── register.png
├── dashboard.png
└── chat.png
```

Then add them to the README:

```markdown
![Login Page](screenshots/login.png)

![Chat Page](screenshots/chat.png)
```

## 🌐 Live Demo

Coming soon.

## 📌 Future Improvements

* 👥 Group Chat
* 📎 File & Image Sharing
* 🎤 Voice Messages
* 📹 Video Calling
* 😊 Emoji Support
* 🔔 Push Notifications
* ✍️ Typing Indicator
* ✔️ Message Read Receipts
* 🗑️ Delete Messages
* ✏️ Edit Messages
* 🌙 Dark/Light Mode
* 🔎 Advanced User Search

## 🎯 Learning Objectives

This project helps demonstrate practical knowledge of:

* React.js
* Node.js
* Express.js
* MongoDB
* Mongoose
* REST APIs
* JWT Authentication
* Socket.IO
* Full-Stack Development
* Git & GitHub
* Client-Server Architecture

## 👨‍💻 Author

**Harsh Kumar**

Full Stack Developer | React Developer

* GitHub: [HarshKumar246735](https://github.com/HarshKumar246735)

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

**Built with ❤️ using React, Node.js, Express, MongoDB & Socket.IO.**
