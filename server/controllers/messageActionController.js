const Message = require("../models/Message");


// ==========================================
// EDIT MESSAGE
// ==========================================

const editMessage = async (req, res) => {
    try {

        const { messageId } = req.params;
        const { message } = req.body;


        // Validate message
        if (!message?.trim()) {
            return res.status(400).json({
                message:
                    "Message cannot be empty"
            });
        }


        // Find message
        const existingMessage =
            await Message.findById(
                messageId
            );


        if (!existingMessage) {
            return res.status(404).json({
                message:
                    "Message not found"
            });
        }


        // Only sender can edit
        if (
            String(
                existingMessage.sender
            ) !==
            String(
                req.userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You can edit only your own messages"
            });
        }


        // Update message
        existingMessage.message =
            message.trim();


        await existingMessage.save();


        // Populate
        const updatedMessage =
            await Message
                .findById(
                    existingMessage._id
                )
                .populate(
                    "sender",
                    "name email profileImage"
                )
                .populate(
                    "receiver",
                    "name email profileImage"
                );


        // Socket.IO
        const io =
            req.app.get("io");


        if (io) {

            const conversationRoom =
                `conversation:${existingMessage.conversation}`;


            io.to(
                conversationRoom
            ).emit(
                "message-updated",
                updatedMessage
            );
        }


        return res.status(200).json({
            message:
                "Message updated successfully",

            data:
                updatedMessage
        });

    } catch (error) {

        console.error(
            "Edit message error:",
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
// DELETE MESSAGE
// ==========================================

const deleteMessage = async (
    req,
    res
) => {

    try {

        const { messageId } =
            req.params;


        // Find message
        const existingMessage =
            await Message.findById(
                messageId
            );


        if (!existingMessage) {
            return res.status(404).json({
                message:
                    "Message not found"
            });
        }


        // Only sender can delete
        if (
            String(
                existingMessage.sender
            ) !==
            String(
                req.userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You can delete only your own messages"
            });
        }


        const conversationId =
            String(
                existingMessage.conversation
            );


        // Delete
        await Message.findByIdAndDelete(
            messageId
        );


        // Socket.IO
        const io =
            req.app.get("io");


        if (io) {

            const conversationRoom =
                `conversation:${conversationId}`;


            io.to(
                conversationRoom
            ).emit(
                "message-deleted",
                {
                    messageId:
                        String(
                            messageId
                        ),

                    conversationId
                }
            );
        }


        return res.status(200).json({
            message:
                "Message deleted successfully",

            messageId:
                String(messageId)
        });

    } catch (error) {

        console.error(
            "Delete message error:",
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
    editMessage,
    deleteMessage
};