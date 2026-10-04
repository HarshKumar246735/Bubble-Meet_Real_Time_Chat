const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Message = require("../models/Message");


// ==========================================
// CREATE OR GET CONVERSATION
// ==========================================

const createOrGetConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        console.log("CREATE CONVERSATION");
        console.log("Logged-in user:", req.userId);
        console.log("Selected user:", userId);

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (String(userId) === String(req.userId)) {
            return res.status(400).json({
                message: "You cannot create a conversation with yourself"
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    req.userId,
                    userId
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    req.userId,
                    userId
                ]
            });

            console.log(
                "New conversation created:",
                conversation._id
            );
        }

        conversation = await Conversation
            .findById(conversation._id)
            .populate(
                "participants",
                "name email profileImage status"
            );

        return res.status(200).json({
            message: "Conversation ready",
            conversation
        });

    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );

        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


// ==========================================
// GET MY CONVERSATIONS
// ==========================================

const getMyConversations = async (req, res) => {
    try {

        const conversations =
            await Conversation
                .find({
                    participants: req.userId
                })
                .populate(
                    "participants",
                    "name email profileImage status"
                )
                .sort({
                    updatedAt: -1
                });


        const formattedConversations =
            await Promise.all(

                conversations.map(
                    async (conversation) => {

                        // Find other user
                        const otherUser =
                            conversation.participants.find(
                                (participant) =>
                                    String(
                                        participant._id
                                    ) !==
                                    String(
                                        req.userId
                                    )
                            );


                        // Find latest message
                        const lastMessage =
                            await Message
                                .findOne({
                                    conversation:
                                        conversation._id
                                })
                                .sort({
                                    createdAt: -1
                                })
                                .select(
                                    "message messageType sender receiver createdAt isRead"
                                );


                        // Count unread messages
                        const unreadCount =
                            await Message.countDocuments({
                                conversation:
                                    conversation._id,

                                receiver:
                                    req.userId,

                                isRead: false
                            });


                        return {
                            _id:
                                conversation._id,

                            otherUser:
                                otherUser || null,

                            lastMessage:
                                lastMessage || null,

                            unreadCount,

                            updatedAt:
                                conversation.updatedAt
                        };
                    }
                )
            );


        return res.status(200).json({
            conversations:
                formattedConversations
        });

    } catch (error) {

        console.error(
            "Get conversations error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Server error"
        });
    }
};


module.exports = {
    createOrGetConversation,
    getMyConversations
};