const Message = require("../models/Message");
const Conversation = require("../models/Conversation");


// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (req, res) => {
    try {

        const {
            conversationId,
            receiverId,
            message
        } = req.body;


        // --------------------------------------
        // VALIDATION
        // --------------------------------------

        if (
            !conversationId ||
            !receiverId ||
            !message?.trim()
        ) {
            return res.status(400).json({
                message:
                    "Conversation, receiver and message are required"
            });
        }


        // --------------------------------------
        // FIND CONVERSATION
        // --------------------------------------

        const conversation =
            await Conversation.findById(
                conversationId
            );


        if (!conversation) {
            return res.status(404).json({
                message:
                    "Conversation not found"
            });
        }


        // --------------------------------------
        // CHECK SENDER
        // --------------------------------------

        const senderIsParticipant =
            conversation.participants.some(
                (participant) =>
                    String(participant) ===
                    String(req.userId)
            );


        if (!senderIsParticipant) {
            return res.status(403).json({
                message:
                    "You are not part of this conversation"
            });
        }


        // --------------------------------------
        // CHECK RECEIVER
        // --------------------------------------

        const receiverIsParticipant =
            conversation.participants.some(
                (participant) =>
                    String(participant) ===
                    String(receiverId)
            );


        if (!receiverIsParticipant) {
            return res.status(400).json({
                message:
                    "Receiver is not part of this conversation"
            });
        }


        // --------------------------------------
        // CREATE MESSAGE
        // --------------------------------------

        const newMessage =
            await Message.create({

                conversation:
                    conversationId,

                sender:
                    req.userId,

                receiver:
                    receiverId,

                message:
                    message.trim(),

                messageType:
                    "text"

            });


        // --------------------------------------
        // UPDATE CONVERSATION
        // --------------------------------------

        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                updatedAt:
                    new Date()
            }
        );


        // --------------------------------------
        // POPULATE MESSAGE
        // --------------------------------------

        const populatedMessage =
            await Message
                .findById(
                    newMessage._id
                )
                .populate(
                    "sender",
                    "name email profileImage"
                )
                .populate(
                    "receiver",
                    "name email profileImage"
                );


        // --------------------------------------
        // SOCKET.IO
        // --------------------------------------

        const io =
            req.app.get("io");


        if (io) {

            const senderRoom =
                `user:${req.userId}`;

            const receiverRoom =
                `user:${receiverId}`;


            // Send to RECEIVER
            io.to(
                receiverRoom
            ).emit(
                "new-message",
                populatedMessage
            );


            // Also send to sender's other tabs/windows
            io.to(
                senderRoom
            ).emit(
                "new-message",
                populatedMessage
            );


            console.log(
                "REAL-TIME MESSAGE SENT"
            );

            console.log(
                "Sender room:",
                senderRoom
            );

            console.log(
                "Receiver room:",
                receiverRoom
            );

        }


        // --------------------------------------
        // RESPONSE TO SENDER
        // --------------------------------------

        return res.status(201).json({

            message:
                "Message sent successfully",

            data:
                populatedMessage

        });


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );


        return res.status(500).json({
            message:
                error.message ||
                "Server error"
        });
    }
};


// ==========================================
// GET MESSAGES
// ==========================================

const getMessages = async (
    req,
    res
) => {

    try {

        const {
            conversationId
        } = req.params;


        const conversation =
            await Conversation.findById(
                conversationId
            );


        if (!conversation) {
            return res.status(404).json({
                message:
                    "Conversation not found"
            });
        }


        const isParticipant =
            conversation.participants.some(
                (participant) =>
                    String(participant) ===
                    String(req.userId)
            );


        if (!isParticipant) {
            return res.status(403).json({
                message:
                    "You are not part of this conversation"
            });
        }


        const messages =
            await Message
                .find({
                    conversation:
                        conversationId
                })
                .populate(
                    "sender",
                    "name email profileImage"
                )
                .populate(
                    "receiver",
                    "name email profileImage"
                )
                .sort({
                    createdAt: 1
                });


        return res.status(200).json({
            messages
        });


    } catch (error) {

        console.error(
            "Get messages error:",
            error
        );


        return res.status(500).json({
            message:
                error.message ||
                "Server error"
        });
    }
};


// ==========================================
// MARK MESSAGES AS READ
// ==========================================

const markMessagesAsRead = async (
    req,
    res
) => {

    try {

        const {
            conversationId
        } = req.params;


        const conversation =
            await Conversation.findById(
                conversationId
            );


        if (!conversation) {
            return res.status(404).json({
                message:
                    "Conversation not found"
            });
        }


        const isParticipant =
            conversation.participants.some(
                (participant) =>
                    String(participant) ===
                    String(req.userId)
            );


        if (!isParticipant) {
            return res.status(403).json({
                message:
                    "You are not part of this conversation"
            });
        }


        await Message.updateMany(
            {
                conversation:
                    conversationId,

                receiver:
                    req.userId,

                isRead:
                    false
            },
            {
                $set: {
                    isRead:
                        true
                }
            }
        );


        return res.status(200).json({
            message:
                "Messages marked as read"
        });


    } catch (error) {

        console.error(
            "Mark read error:",
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
    sendMessage,
    getMessages,
    markMessagesAsRead
};