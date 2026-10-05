const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reactionRoutes = require("./routes/reactionRoutes");

const User = require("./models/User");

dotenv.config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://bubble-meet-real-time-chat.vercel.app"
        ],
        credentials: true
    })
);

app.use(express.json());


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/conversations",
    conversationRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);

app.use(
    "/api/reactions",
    reactionRoutes
);


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message:
            "Real-Time Chat API is running"
    });
});


// ==========================================
// HTTP SERVER
// ==========================================

const server =
    http.createServer(app);


// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://bubble-meet-real-time-chat.vercel.app"
        ],
        methods: [
            "GET",
            "POST",
            "PATCH",
            "DELETE"
        ],
        credentials: true
    }
});


// ==========================================
// MAKE SOCKET.IO AVAILABLE
// INSIDE CONTROLLERS
// ==========================================

app.set(
    "io",
    io
);


// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "Socket connected:",
            socket.id
        );


        // ==========================================
        // JOIN USER ROOM
        // ==========================================

        socket.on(
            "join-user",
            async (userId) => {

                try {

                    if (!userId) {
                        return;
                    }


                    const cleanUserId =
                        String(userId);


                    const roomName =
                        `user:${cleanUserId}`;


                    socket.join(
                        roomName
                    );


                    // Store user ID

                    socket.userId =
                        cleanUserId;

                    socket.data.userId =
                        cleanUserId;


                    // --------------------------------------
                    // UPDATE USER ONLINE
                    // --------------------------------------

                    await User.findByIdAndUpdate(
                        cleanUserId,
                        {
                            status:
                                "online",

                            lastSeen:
                                new Date()
                        }
                    );


                    console.log(
                        `User ${cleanUserId} joined ${roomName}`
                    );


                    console.log(
                        `User ${cleanUserId} is ONLINE`
                    );


                    // --------------------------------------
                    // BROADCAST STATUS
                    // --------------------------------------

                    io.emit(
                        "user-status",
                        {
                            userId:
                                cleanUserId,

                            status:
                                "online",

                            lastSeen:
                                new Date()
                        }
                    );


                } catch (error) {

                    console.error(
                        "Join user error:",
                        error
                    );
                }
            }
        );


        // ==========================================
        // JOIN CONVERSATION
        // ==========================================

        socket.on(
            "join-conversation",
            (conversationId) => {

                if (!conversationId) {
                    return;
                }


                const cleanConversationId =
                    String(conversationId);


                const roomName =
                    `conversation:${cleanConversationId}`;


                socket.join(
                    roomName
                );


                console.log(
                    `Socket ${socket.id} joined ${roomName}`
                );
            }
        );


        // ==========================================
        // LEAVE CONVERSATION
        // ==========================================

        socket.on(
            "leave-conversation",
            (conversationId) => {

                if (!conversationId) {
                    return;
                }


                const roomName =
                    `conversation:${conversationId}`;


                socket.leave(
                    roomName
                );


                console.log(
                    `Socket ${socket.id} left ${roomName}`
                );
            }
        );


        // ==========================================
        // START TYPING
        // ==========================================

        socket.on(
            "typing",
            ({ conversationId }) => {

                if (
                    !conversationId ||
                    !socket.data.userId
                ) {
                    return;
                }


                const roomName =
                    `conversation:${conversationId}`;


                console.log(
                    `User ${socket.data.userId} is typing in ${roomName}`
                );


                // Send only to other users
                // in the conversation

                socket
                    .to(roomName)
                    .emit(
                        "user-typing",
                        {
                            conversationId:
                                String(
                                    conversationId
                                ),

                            userId:
                                String(
                                    socket.data.userId
                                )
                        }
                    );
            }
        );


        // ==========================================
        // STOP TYPING
        // ==========================================

        socket.on(
            "stop-typing",
            ({ conversationId }) => {

                if (
                    !conversationId ||
                    !socket.data.userId
                ) {
                    return;
                }


                const roomName =
                    `conversation:${conversationId}`;


                console.log(
                    `User ${socket.data.userId} stopped typing in ${roomName}`
                );


                socket
                    .to(roomName)
                    .emit(
                        "user-stop-typing",
                        {
                            conversationId:
                                String(
                                    conversationId
                                ),

                            userId:
                                String(
                                    socket.data.userId
                                )
                        }
                    );
            }
        );


        // ==========================================
        // DISCONNECT
        // ==========================================

        socket.on(
            "disconnect",
            async (reason) => {

                console.log(
                    "Socket disconnected:",
                    socket.id
                );


                console.log(
                    "Reason:",
                    reason
                );


                const userId =
                    socket.data.userId ||
                    socket.userId;


                if (!userId) {
                    return;
                }


                try {

                    const userRoom =
                        `user:${userId}`;


                    // Check if the same
                    // user has another
                    // active socket

                    const remainingSockets =
                        await io
                            .in(userRoom)
                            .fetchSockets();


                    if (
                        remainingSockets.length === 0
                    ) {

                        // --------------------------------------
                        // UPDATE OFFLINE
                        // --------------------------------------

                        const lastSeen =
                            new Date();


                        await User.findByIdAndUpdate(
                            userId,
                            {
                                status:
                                    "offline",

                                lastSeen
                            }
                        );


                        console.log(
                            `User ${userId} is OFFLINE`
                        );


                        // --------------------------------------
                        // BROADCAST STATUS
                        // --------------------------------------

                        io.emit(
                            "user-status",
                            {
                                userId:
                                    String(
                                        userId
                                    ),

                                status:
                                    "offline",

                                lastSeen
                            }
                        );
                    }

                } catch (error) {

                    console.error(
                        "Disconnect status error:",
                        error
                    );
                }
            }
        );

    }
);


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "Socket.IO server is ready"
        );
    }
);