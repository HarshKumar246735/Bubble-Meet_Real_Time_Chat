import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import ReactionPicker from "../components/ReactionPicker";
import MessageReactions from "../components/MessageReactions";
import ReadReceipt from "../components/ReadReceipt";
import {
    useNavigate
} from "react-router-dom";

import axios from "axios";

import { io } from "socket.io-client";

import "../css/Chat.css";


const API =
    "http://localhost:5000/api";

const SOCKET_URL =
    "http://localhost:5000";


// ==========================================
// GET ID FROM STRING / OBJECT
// ==========================================

const getId = (value) => {

    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return String(
            value._id ||
            value.id ||
            value.userId ||
            ""
        );
    }

    return String(value);
};


// ==========================================
// GET CURRENT USER ID
// ==========================================

const getCurrentUserId = (user) => {

    if (!user) {
        return "";
    }

    return String(
        user._id ||
        user.id ||
        user.userId ||
        ""
    );
};


// ==========================================
// CHECK WHETHER MESSAGE IS MINE
// ==========================================

const isMessageMine = (
    message,
    currentUser
) => {

    const currentUserId =
        getCurrentUserId(
            currentUser
        );

    const senderId =
        getId(
            message?.sender
        );


    // ID comparison

    if (
        currentUserId &&
        senderId &&
        currentUserId === senderId
    ) {
        return true;
    }


    // Email backup

    if (
        message?.sender?.email &&
        currentUser?.email
    ) {

        return (
            message.sender.email
                .toLowerCase() ===
            currentUser.email
                .toLowerCase()
        );
    }


    return false;
};


// ==========================================
// MERGE MESSAGES WITHOUT DUPLICATES
// ==========================================

const mergeMessages = (
    oldMessages,
    newMessages
) => {

    const allMessages = [
        ...oldMessages,
        ...newMessages
    ];


    const uniqueMessages =
        new Map();


    allMessages.forEach(
        (message) => {

            if (
                message?._id
            ) {

                uniqueMessages.set(
                    String(
                        message._id
                    ),
                    message
                );
            }
        }
    );


    return Array.from(
        uniqueMessages.values()
    ).sort(
        (a, b) => {

            return (
                new Date(
                    a.createdAt
                ).getTime() -
                new Date(
                    b.createdAt
                ).getTime()
            );
        }
    );
};


const Chat = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [user, setUser] =
        useState(null);


    const [users, setUsers] =
        useState([]);


    const [conversations, setConversations] =
        useState([]);


    const [selectedUser, setSelectedUser] =
        useState(null);


    const [conversation, setConversation] =
        useState(null);


    const [messages, setMessages] =
        useState([]);


    const [search, setSearch] =
        useState("");


    const [messageText, setMessageText] =
        useState("");


    const [loadingUsers, setLoadingUsers] =
        useState(true);


    const [messagesLoading, setMessagesLoading] =
        useState(false);


    const [sendingMessage, setSendingMessage] =
        useState(false);


    const [conversationError, setConversationError] =
        useState("");


    const [typingUserId, setTypingUserId] =
    useState(null);
    const [messageReactions, setMessageReactions] = useState({});
const [openReactionMessage, setOpenReactionMessage] = useState(null);


    // ==========================================
    // REFS
    // ==========================================

    const socketRef =
        useRef(null);


    const conversationRef =
        useRef(null);


    const messagesEndRef =
        useRef(null);


    const typingTimeoutRef =
        useRef(null);


    // ==========================================
    // TOKEN
    // ==========================================

    const getToken = () => {

        return localStorage.getItem(
            "token"
        );
    };


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (date) => {

        if (!date) {
            return "";
        }


        return new Date(date)
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    };


    // ==========================================
    // LOAD USER
    // ==========================================

    useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );


        const savedUser =
            localStorage.getItem(
                "user"
            );


        if (
            !token ||
            !savedUser
        ) {

            navigate(
                "/login"
            );

            return;
        }


        try {

            const parsedUser =
                JSON.parse(
                    savedUser
                );


            console.log(
                "CURRENT USER:",
                parsedUser
            );


            setUser(
                parsedUser
            );

        } catch (error) {

            console.error(
                "User data error:",
                error
            );


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            navigate(
                "/login"
            );
        }

    }, [navigate]);


    // ==========================================
    // SOCKET CONNECTION
    // ==========================================

    useEffect(() => {

        if (!user) {
            return;
        }


        const currentUserId =
            getCurrentUserId(
                user
            );


        if (!currentUserId) {
            return;
        }


        console.log(
            "Connecting Socket.IO for user:",
            currentUserId
        );


        const socket =
            io(
                SOCKET_URL,
                {
                    transports: [
                        "websocket"
                    ],

                    withCredentials:
                        true
                }
            );


        socketRef.current =
            socket;


        // ==================================
        // SOCKET CONNECT
        // ==================================

        socket.on(
            "connect",
            () => {

                console.log(
                    "Socket connected:",
                    socket.id
                );


                // Join personal room

                socket.emit(
                    "join-user",
                    currentUserId
                );


                console.log(
                    "Joined user room:",
                    currentUserId
                );


                // If a conversation
                // already exists, join it

                if (
                    conversationRef
                        .current?._id
                ) {

                    socket.emit(
                        "join-conversation",
                        conversationRef
                            .current
                            ._id
                    );


                    console.log(
                        "Joined active conversation:",
                        conversationRef
                            .current
                            ._id
                    );
                }
            }
        );


        // ==================================
        // ONLINE / OFFLINE
        // ==================================

        socket.on(
            "user-status",
            (data) => {

                console.log(
                    "USER STATUS UPDATE:",
                    data
                );


                // Update users

                setUsers(
                    (previousUsers) =>
                        previousUsers.map(
                            (item) => {

                                if (
                                    String(
                                        item._id
                                    ) ===
                                    String(
                                        data.userId
                                    )
                                ) {

                                    return {
                                        ...item,

                                        status:
                                            data.status,

                                        lastSeen:
                                            data.lastSeen
                                    };
                                }


                                return item;
                            }
                        )
                );


                // Update selected user

                setSelectedUser(
                    (previousUser) => {

                        if (
                            !previousUser
                        ) {
                            return previousUser;
                        }


                        if (
                            String(
                                previousUser._id
                            ) !==
                            String(
                                data.userId
                            )
                        ) {
                            return previousUser;
                        }


                        return {
                            ...previousUser,

                            status:
                                data.status,

                            lastSeen:
                                data.lastSeen
                        };
                    }
                );


                // Update conversation
                // participant status

                setConversations(
                    (previousConversations) =>
                        previousConversations.map(
                            (item) => {

                                if (
                                    String(
                                        item.otherUser?._id
                                    ) ===
                                    String(
                                        data.userId
                                    )
                                ) {

                                    return {
                                        ...item,

                                        otherUser: {
                                            ...item.otherUser,

                                            status:
                                                data.status,

                                            lastSeen:
                                                data.lastSeen
                                        }
                                    };
                                }


                                return item;
                            }
                        )
                );
            }
        );


        // ==================================
        // NEW MESSAGE
        // ==================================

        socket.on(
            "new-message",
            async (newMessage) => {

                console.log(
                    "REAL-TIME MESSAGE RECEIVED:",
                    newMessage
                );


                if (
                    !newMessage?._id
                ) {
                    return;
                }


                const activeConversation =
                    conversationRef.current;


                const currentUserId =
                    getCurrentUserId(
                        user
                    );


                const messageConversationId =
                    getId(
                        newMessage.conversation
                    );


                const activeConversationId =
                    getId(
                        activeConversation
                    );


                const isCurrentChat =
                    messageConversationId ===
                    activeConversationId;


                const receiverId =
                    getId(
                        newMessage.receiver
                    );


                const isForCurrentUser =
                    receiverId ===
                    currentUserId;


                // --------------------------
                // UPDATE OPEN CHAT
                // --------------------------

                if (
                    isCurrentChat
                ) {

                    setMessages(
                        (previousMessages) =>
                            mergeMessages(
                                previousMessages,
                                [newMessage]
                            )
                    );


                    // Mark as read because
                    // conversation is open

                    if (
                        isForCurrentUser
                    ) {

                        try {

                            await axios.patch(
                                `${API}/messages/${activeConversationId}/read`,
                                {},
                                {
                                    headers: {
                                        Authorization:
                                            `Bearer ${getToken()}`
                                    }
                                }
                            );

                        } catch (error) {

                            console.error(
                                "Auto read error:",
                                error
                            );
                        }
                    }
                }


                // --------------------------
                // UPDATE SIDEBAR
                // --------------------------

                setConversations(
                    (previousConversations) =>
                        previousConversations.map(
                            (item) => {

                                const itemId =
                                    getId(item);


                                if (
                                    itemId !==
                                    messageConversationId
                                ) {

                                    return item;
                                }


                                return {
                                    ...item,

                                    lastMessage:
                                        newMessage,

                                    updatedAt:
                                        newMessage.createdAt,

                                    unreadCount:
                                        isCurrentChat
                                            ? 0
                                            : isForCurrentUser
                                                ? (
                                                    item.unreadCount ||
                                                    0
                                                ) + 1
                                                : item.unreadCount ||
                                                  0
                                };
                            }
                        )
                );
            }
        );


        // ==================================
        // SOMEONE IS TYPING
        // ==================================

        socket.on(
    "user-typing",
    (data) => {

        console.log(
            "USER TYPING:",
            data
        );

        const activeConversation =
            conversationRef.current;

        const currentUserId =
            getCurrentUserId(user);

        if (
            !activeConversation?._id
        ) {
            return;
        }

        // Invalid event ignore
        if (!data?.userId) {
            return;
        }

        // Different conversation ignore
        if (
            String(data.conversationId) !==
            String(activeConversation._id)
        ) {
            return;
        }

        // VERY IMPORTANT:
        // If current user is typing, ignore it
        if (
            String(data.userId) ===
            String(currentUserId)
        ) {
            return;
        }

        // Only other user is typing
        setTypingUserId(
            String(data.userId)
        );
    }
);
        // ==================================
        // STOP TYPING
        // ==================================

        socket.on(
    "user-stop-typing",
    (data) => {

        console.log(
            "USER STOPPED TYPING:",
            data
        );

        const activeConversation =
            conversationRef.current;

        if (
            !activeConversation?._id
        ) {
            return;
        }

        if (
            String(data.conversationId) !==
            String(activeConversation._id)
        ) {
            return;
        }

        // Only clear the typing user
        setTypingUserId(
            null
        );
    }
);

        // ==================================
        // SOCKET ERROR
        // ==================================

        socket.on(
            "connect_error",
            (error) => {

                console.error(
                    "Socket connection error:",
                    error
                );
            }
        );


        // ==================================
        // DISCONNECT
        // ==================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "Socket disconnected:",
                    reason
                );
            }
        );


        // ==================================
        // CLEANUP
        // ==================================

        return () => {

            if (
                typingTimeoutRef
                    .current
            ) {

                clearTimeout(
                    typingTimeoutRef
                        .current
                );
            }


            socket.disconnect();

            socketRef.current =
                null;
        };

    }, [user]);


    // ==========================================
    // FETCH USERS
    // ==========================================

    const fetchUsers = async () => {

        const token =
            getToken();


        if (!token) {
            return;
        }


        try {

            setLoadingUsers(
                true
            );


            const response =
                await axios.get(
                    `${API}/users`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const savedUser =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    )
                );


            const currentUserId =
                getCurrentUserId(
                    savedUser
                );


            const otherUsers =
                (
                    response
                        .data
                        .users || []
                ).filter(
                    (item) =>
                        String(
                            item._id
                        ) !==
                        String(
                            currentUserId
                        )
                );


            console.log(
                "OTHER USERS:",
                otherUsers
            );


            setUsers(
                otherUsers
            );

        } catch (error) {

            console.error(
                "Users error:",
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                navigate(
                    "/login"
                );
            }

        } finally {

            setLoadingUsers(
                false
            );
        }
    };


    // ==========================================
    // FETCH CONVERSATIONS
    // ==========================================

    const fetchConversations =
        async () => {

            const token =
                getToken();


            if (!token) {
                return;
            }


            try {

                const response =
                    await axios.get(
                        `${API}/conversations`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                setConversations(
                    response
                        .data
                        .conversations || []
                );

            } catch (error) {

                console.error(
                    "Conversations error:",
                    error
                );
            }
        };


    // ==========================================
    // INITIAL FETCH
    // ==========================================

    useEffect(() => {

        if (!user) {
            return;
        }


        fetchUsers();

        fetchConversations();

    }, [user]);


    // ==========================================
    // BUILD CHAT LIST
    // ==========================================

    const chatList =
        useMemo(() => {

            const conversationMap =
                new Map();


            conversations.forEach(
                (item) => {

                    if (
                        item.otherUser?._id
                    ) {

                        conversationMap.set(
                            String(
                                item.otherUser._id
                            ),
                            item
                        );
                    }
                }
            );


            const list =
                users.map(
                    (item) => ({

                        user:
                            item,

                        conversation:
                            conversationMap.get(
                                String(
                                    item._id
                                )
                            ) || null
                    })
                );


            // Latest conversation
            // comes first

            list.sort(
                (a, b) => {

                    const aTime =
                        a.conversation
                            ?.updatedAt
                            ? new Date(
                                a.conversation
                                    .updatedAt
                            ).getTime()
                            : 0;


                    const bTime =
                        b.conversation
                            ?.updatedAt
                            ? new Date(
                                b.conversation
                                    .updatedAt
                            ).getTime()
                            : 0;


                    if (
                        aTime !==
                        bTime
                    ) {

                        return (
                            bTime -
                            aTime
                        );
                    }


                    return (
                        a.user.name ||
                        ""
                    ).localeCompare(
                        b.user.name ||
                        ""
                    );
                }
            );


            return list;

        }, [
            users,
            conversations
        ]);


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredChats =
        chatList.filter(
            ({
                user: item
            }) => {

                const searchText =
                    search
                        .toLowerCase()
                        .trim();


                return (
                    item.name
                        ?.toLowerCase()
                        .includes(
                            searchText
                        ) ||

                    item.email
                        ?.toLowerCase()
                        .includes(
                            searchText
                        )
                );
            }
        );


    // ==========================================
    // FETCH MESSAGE HISTORY
    // ==========================================

    const fetchMessages =
        async (
            conversationId
        ) => {

            const token =
                getToken();


            if (
                !token ||
                !conversationId
            ) {

                return;
            }


            try {

                setMessagesLoading(
                    true
                );


                const response =
                    await axios.get(
                        `${API}/messages/${conversationId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const apiMessages =
                    response
                        .data
                        .messages || [];


                setMessages(
                    mergeMessages(
                        [],
                        apiMessages
                    )
                );

            } catch (error) {

                console.error(
                    "Messages error:",
                    error
                );

            } finally {

                setMessagesLoading(
                    false
                );
            }
        };


    // ==========================================
    // SELECT USER
    // ==========================================

    const handleSelectUser =
        async (
            selected
        ) => {

            const token =
                getToken();


            if (!token) {

                navigate(
                    "/login"
                );

                return;
            }


            try {

                setSelectedUser(
                    selected
                );


                setConversation(
                    null
                );


                conversationRef.current =
                    null;


                setMessages(
                    []
                );


                setMessageText(
                    ""
                );


                setConversationError(
                    ""
                );


                setTypingUserId(
                    false
                );


                const response =
                    await axios.post(
                        `${API}/conversations`,
                        {
                            userId:
                                selected._id
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const newConversation =
                    response
                        .data
                        .conversation;


                console.log(
                    "OPENED CONVERSATION:",
                    newConversation
                );


                setConversation(
                    newConversation
                );


                conversationRef.current =
                    newConversation;


                // Join room immediately

                if (
                    socketRef.current
                ) {

                    socketRef.current.emit(
                        "join-conversation",
                        newConversation._id
                    );


                    console.log(
                        "Joined conversation:",
                        newConversation._id
                    );
                }


                // Load old messages

                await fetchMessages(
                    newConversation._id
                );


                // Mark received messages
                // as read

                await axios.patch(
                    `${API}/messages/${newConversation._id}/read`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                await fetchConversations();

            } catch (error) {

                console.error(
                    "Open conversation error:",
                    error
                );


                setConversationError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to open conversation"
                );
            }
        };


    // ==========================================
    // CONVERSATION ROOM
    // ==========================================

    useEffect(() => {

        const socket =
            socketRef.current;


        if (
            !socket ||
            !conversation?._id
        ) {

            return;
        }


        const conversationId =
            conversation._id;


        socket.emit(
            "join-conversation",
            conversationId
        );


        console.log(
            "Conversation room joined:",
            conversationId
        );


        return () => {

            socket.emit(
                "leave-conversation",
                conversationId
            );


            console.log(
                "Conversation room left:",
                conversationId
            );
        };

    }, [
        conversation
    ]);


    // ==========================================
    // HANDLE TYPING
    // ==========================================

    const handleTyping = (value) => {

    setMessageText(value);

    const socket =
        socketRef.current;

    const activeConversation =
        conversationRef.current;

    if (
        !socket ||
        !activeConversation?._id
    ) {
        return;
    }

    socket.emit(
        "typing",
        {
            conversationId:
                activeConversation._id
        }
    );

    if (
        typingTimeoutRef.current
    ) {
        clearTimeout(
            typingTimeoutRef.current
        );
    }

    typingTimeoutRef.current =
        setTimeout(
            () => {

                socket.emit(
                    "stop-typing",
                    {
                        conversationId:
                            activeConversation._id
                    }
                );

            },
            1000
        );
};
    // ==========================================
    // STOP TYPING
    // ==========================================

    const stopTyping =
        () => {

            const socket =
                socketRef.current;


            const activeConversation =
                conversationRef.current;


            if (
                socket &&
                activeConversation?._id
            ) {

                socket.emit(
                    "stop-typing",
                    {
                        conversationId:
                            activeConversation
                                ._id
                    }
                );
            }


            if (
                typingTimeoutRef
                    .current
            ) {

                clearTimeout(
                    typingTimeoutRef
                        .current
                );

                typingTimeoutRef.current =
                    null;
            }
        };


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSendMessage =
        async () => {

            const text =
                messageText.trim();


            if (
                !text ||
                !conversation?._id ||
                !selectedUser?._id
            ) {

                return;
            }


            const token =
                getToken();


            if (!token) {

                navigate(
                    "/login"
                );

                return;
            }


            try {

                setSendingMessage(
                    true
                );


                // Stop typing

                stopTyping();


                const response =
                    await axios.post(
                        `${API}/messages`,
                        {
                            conversationId:
                                conversation._id,

                            receiverId:
                                selectedUser._id,

                            message:
                                text
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const newMessage =
                    response
                        .data
                        .data;


                // Add message immediately
                // for sender

                if (
                    newMessage
                ) {

                    setMessages(
                        (previousMessages) =>
                            mergeMessages(
                                previousMessages,
                                [newMessage]
                            )
                    );
                }


                setMessageText(
                    ""
                );


                // Refresh sidebar data

                await fetchConversations();


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );


                console.error(
                    "SERVER RESPONSE:",
                    error.response
                        ?.data
                );

            } finally {

                setSendingMessage(
                    false
                );
            }
        };


    // ==========================================
    // ENTER TO SEND
    // ==========================================

    const handleKeyDown =
        (e) => {

            if (
                e.key ===
                "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                handleSendMessage();
            }
        };


    // ==========================================
    // AUTO SCROLL
    // ==========================================

    useEffect(() => {

        messagesEndRef
            .current
            ?.scrollIntoView({
                behavior:
                    "smooth"
            });

    }, [
        messages
    ]);


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout =
        () => {

            stopTyping();


            if (
                socketRef.current
            ) {

                socketRef.current
                    .disconnect();

                socketRef.current =
                    null;
            }


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            navigate(
                "/login"
            );
        };


    // ==========================================
    // MESSAGE PREVIEW
    // ==========================================

    const getPreview =
        (
            itemConversation
        ) => {

            if (
                !itemConversation
                    ?.lastMessage
            ) {

                return "Start a conversation";
            }


            const lastMessage =
                itemConversation
                    .lastMessage;


            const currentUserId =
                getCurrentUserId(
                    user
                );


            const senderId =
                getId(
                    lastMessage.sender
                );


            if (
                senderId ===
                currentUserId
            ) {

                return (
                    "You: " +
                    (
                        lastMessage.message ||
                        "Message"
                    )
                );
            }


            return (
                lastMessage.message ||
                "Message"
            );
        };


    // ==========================================
    // LOADING
    // ==========================================

    if (!user) {

        return (
            <div
                className="chat-loading"
            >

                <div
                    className="chat-loading-spinner"
                ></div>

                <p>
                    Loading Bubble Meet...
                </p>

            </div>
        );
    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="chat-page">


            {/* ==================================
                LEFT SIDEBAR
            ================================== */}

            <aside
                className="chat-sidebar"
            >


                {/* BRAND */}

                <div className="chat-brand">

                    <div
                        className="chat-brand-icon"
                    >

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>


                    <div>

                        <h1>
                            Bubble{" "}
                            <span>
                                Meet
                            </span>
                        </h1>


                        <p>
                            Real-time connections
                        </p>

                    </div>

                </div>


                {/* CURRENT USER */}

                <div
                    className="sidebar-user"
                >

                    <div
                        className="user-avatar"
                    >

                        {
                            user.name
                                ?.charAt(0)
                                .toUpperCase()
                        }


                        <span
                            className="online-status"
                        ></span>

                    </div>


                    <div
                        className="user-info"
                    >

                        <strong>
                            {user.name}
                        </strong>


                        <span>
                            Online
                        </span>

                    </div>


                    <button
                        className="user-menu-button"
                        title="Account"
                    >
                        ⋮
                    </button>

                </div>


                {/* SEARCH */}

                <div
                    className="chat-search"
                >

                    <span>
                        ⌕
                    </span>


                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={
                            search
                        }
                        onChange={
                            (e) =>
                                setSearch(
                                    e.target.value
                                )
                        }
                    />

                </div>


                {/* CHATS HEADING */}

                <div
                    className="conversation-heading"
                >

                    <span>
                        CHATS
                    </span>


                    <span
                        className="people-count"
                    >
                        {
                            filteredChats.length
                        }
                    </span>

                </div>


                {/* CHAT LIST */}

                <div
                    className="users-list"
                >

                    {loadingUsers ? (

                        <div
                            className="users-loading"
                        >

                            <div
                                className="small-spinner"
                            ></div>

                            <p>
                                Loading chats...
                            </p>

                        </div>

                    ) : filteredChats.length === 0 ? (

                        <div
                            className="empty-conversations"
                        >

                            <div
                                className="empty-icon"
                            >
                                👥
                            </div>


                            <h3>
                                No chats found
                            </h3>


                            <p>
                                Select someone to
                                start chatting.
                            </p>

                        </div>

                    ) : (

                        filteredChats.map(
                            ({
                                user: item,
                                conversation:
                                    itemConversation
                            }) => (

                                <button
                                    key={
                                        String(
                                            item._id
                                        )
                                    }

                                    className={
                                        `user-list-item ${
                                            selectedUser?._id ===
                                            item._id
                                                ? "user-selected"
                                                : ""
                                        }`
                                    }

                                    onClick={() =>
                                        handleSelectUser(
                                            item
                                        )
                                    }
                                >


                                    {/* AVATAR */}

                                    <div
                                        className="list-avatar"
                                    >

                                        {
                                            item.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        }


                                        <span
                                            className={
                                                item.status ===
                                                "online"
                                                    ? "list-online"
                                                    : "list-offline"
                                            }
                                        ></span>

                                    </div>


                                    {/* DETAILS */}

                                    <div
                                        className="list-user-info"
                                    >


                                        <div
                                            className="chat-name-line"
                                        >

                                            <strong>
                                                {
                                                    item.name
                                                }
                                            </strong>


                                            {
                                                itemConversation
                                                    ?.lastMessage && (

                                                    <span
                                                        className="chat-time"
                                                    >
                                                        {
                                                            formatTime(
                                                                itemConversation
                                                                    .lastMessage
                                                                    .createdAt
                                                            )
                                                        }
                                                    </span>
                                                )
                                            }

                                        </div>


                                        <div
                                            className="chat-preview-line"
                                        >

                                            <span>
                                                {
                                                    getPreview(
                                                        itemConversation
                                                    )
                                                }
                                            </span>


                                            {
                                                itemConversation
                                                    ?.unreadCount >
                                                0 && (

                                                    <span
                                                        className="unread-badge"
                                                    >
                                                        {
                                                            itemConversation
                                                                .unreadCount
                                                        }
                                                    </span>
                                                )
                                            }

                                        </div>

                                    </div>

                                </button>
                            )
                        )
                    )}

                </div>


                {/* SIDEBAR BOTTOM */}

                <div
                    className="sidebar-bottom"
                >

                    <button
                        className="sidebar-action"
                    >
                        ⚙

                        <span>
                            Settings
                        </span>
                    </button>


                    <button
                        className="sidebar-action logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        ↪

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </aside>


            {/* ==================================
                MAIN CHAT
            ================================== */}

            <main
                className="chat-main"
            >


                {!selectedUser ? (

                    <div
                        className="welcome-screen"
                    >

                        <div
                            className="welcome-icon"
                        >
                            💬
                        </div>


                        <h1>
                            Welcome to Bubble Meet
                        </h1>


                        <p>
                            Select a conversation
                            from the left to start
                            messaging.
                        </p>

                    </div>

                ) : (

                    <>


                        {/* =================================
                            HEADER
                        ================================= */}

                        <header
                            className="chat-header"
                        >

                            <div
                                className="chat-header-info"
                            >

                                <div
                                    className="selected-avatar"
                                >

                                    {
                                        selectedUser
                                            .name
                                            ?.charAt(0)
                                            .toUpperCase()
                                    }


                                    <span
                                        className={
                                            selectedUser
                                                .status ===
                                            "online"
                                                ? "selected-online"
                                                : "selected-offline"
                                        }
                                    ></span>

                                </div>


                                <div>

                                    <h2>
                                        {
                                            selectedUser
                                                .name
                                        }
                                    </h2>


                                    <p
    className={
        typingUserId
            ? "typing-status"
            : ""
    }
>
    {
        typingUserId &&
        String(typingUserId) ===
        String(selectedUser?._id)
            ? "Typing..."
            : selectedUser.status ===
              "online"
                ? "Online"
                : "Offline"
    }
</p>

                                </div>

                            </div>


                            <div
                                className="header-actions"
                            >

                                <button
                                    type="button"
                                    title="Call"
                                >
                                    ☎
                                </button>


                                <button
                                    type="button"
                                    title="More"
                                >
                                    ⋮
                                </button>

                            </div>

                        </header>


                        {/* =================================
                            MESSAGES
                        ================================= */}

                        <section
                            className="messages-container"
                        >

                            {
                                conversationError ? (

                                    <div
                                        className="message-error"
                                    >
                                        {
                                            conversationError
                                        }
                                    </div>

                                ) : messagesLoading ? (

                                    <div
                                        className="messages-loading"
                                    >

                                        <div
                                            className="small-spinner"
                                        ></div>

                                        <p>
                                            Loading messages...
                                        </p>

                                    </div>

                                ) : messages.length === 0 ? (

                                    <div
                                        className="chat-empty"
                                    >

                                        <div
                                            className="chat-empty-orbit"
                                        >

                                            <div
                                                className="chat-empty-icon"
                                            >
                                                👋
                                            </div>

                                        </div>


                                        <h2>
                                            Say hello to{" "}
                                            {
                                                selectedUser
                                                    .name
                                            }
                                        </h2>


                                        <p>
                                            This is the
                                            beginning of your
                                            conversation.
                                        </p>

                                    </div>

                                ) : (

                                    <div
                                        className="messages-list"
                                    >

                                        {
                                            messages.map(
                                                (item) => {

                                                    const mine =
                                                        isMessageMine(
                                                            item,
                                                            user
                                                        );


                                                    return (

                                                        <div
                                                            key={
                                                                String(
                                                                    item._id
                                                                )
                                                            }

                                                            className={
                                                                mine
                                                                    ? "message-row message-row-own"
                                                                    : "message-row message-row-other"
                                                            }
                                                        >

                                                            <div
    className={
        mine
            ? "message-bubble message-bubble-own"
            : "message-bubble message-bubble-other"
    }
>
    <p>
        {item.message}
    </p>

    <span className="message-meta">
        {formatTime(item.createdAt)}

        {mine && (
            <ReadReceipt
                message={item}
            />
        )}
    </span>
</div>

                                                        </div>
                                                    );
                                                }
                                            )
                                        }


                                        <div
                                            ref={
                                                messagesEndRef
                                            }
                                        ></div>

                                    </div>

                                )
                            }

                        </section>


                        {/* =================================
                            MESSAGE INPUT
                        ================================= */}

                        <div
                            className="message-area"
                        >

                            <div
                                className="message-input-wrapper"
                            >


                                <button
                                    type="button"
                                    className="input-action"
                                    title="Attachment"
                                >
                                    ＋
                                </button>


                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={
                                        messageText
                                    }

                                    onChange={
                                        (e) =>
                                            handleTyping(
                                                e.target.value
                                            )
                                    }

                                    onKeyDown={
                                        handleKeyDown
                                    }
                                />


                                <button
                                    type="button"
                                    className="emoji-button"
                                    title="Emoji"
                                >
                                    ☺
                                </button>


                                <button
                                    type="button"
                                    className="send-button"

                                    onClick={
                                        handleSendMessage
                                    }

                                    disabled={
                                        sendingMessage ||
                                        !messageText.trim()
                                    }
                                >

                                    {
                                        sendingMessage
                                            ? "..."
                                            : "➤"
                                    }

                                </button>

                            </div>

                        </div>

                    </>
                )}

            </main>

        </div>
    );
};


export default Chat;