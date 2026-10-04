const Reaction = require("../models/Reaction");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");


// ==========================================
// GET MESSAGE REACTIONS
// ==========================================

const getMessageReactions = async (
    req,
    res
) => {
    try {

        const {
            messageId
        } = req.params;


        const message =
            await Message.findById(
                messageId
            );


        if (!message) {
            return res.status(404).json({
                message:
                    "Message not found"
            });
        }


        const conversation =
            await Conversation.findById(
                message.conversation
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


        const reactions =
            await Reaction.find({
                message: messageId
            });


        const counts = {};


        reactions.forEach(
            (reaction) => {

                counts[reaction.emoji] =
                    (
                        counts[
                            reaction.emoji
                        ] || 0
                    ) + 1;
            }
        );


        const currentUserReaction =
            reactions.find(
                (reaction) =>
                    String(
                        reaction.user
                    ) ===
                    String(
                        req.userId
                    )
            );


        return res.status(200).json({

            messageId:
                String(messageId),

            counts,

            userReaction:
                currentUserReaction
                    ?.emoji || null

        });

    } catch (error) {

        console.error(
            "Get reactions error:",
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
// TOGGLE REACTION
// ==========================================

const toggleReaction = async (
    req,
    res
) => {
    try {

        const {
            messageId
        } = req.params;


        const {
            emoji
        } = req.body;


        const allowedEmojis = [
            "❤️",
            "👍",
            "😂",
            "😮",
            "😢",
            "😡"
        ];


        if (
            !allowedEmojis.includes(
                emoji
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid reaction"
            });
        }


        const message =
            await Message.findById(
                messageId
            );


        if (!message) {
            return res.status(404).json({
                message:
                    "Message not found"
            });
        }


        const conversation =
            await Conversation.findById(
                message.conversation
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


        // Check existing reaction

        const existingReaction =
            await Reaction.findOne({
                message:
                    messageId,

                user:
                    req.userId
            });


        let action;


        // ==================================
        // REMOVE / UPDATE
        // ==================================

        if (existingReaction) {

            // Same emoji -> remove

            if (
                existingReaction.emoji ===
                emoji
            ) {

                await Reaction.findByIdAndDelete(
                    existingReaction._id
                );

                action = "removed";

            } else {

                // Different emoji -> update

                existingReaction.emoji =
                    emoji;

                await existingReaction.save();

                action = "updated";
            }

        } else {

            // ==================================
            // ADD NEW
            // ==================================

            await Reaction.create({
                message:
                    messageId,

                user:
                    req.userId,

                emoji
            });

            action = "added";
        }


        // ==================================
        // GET UPDATED REACTIONS
        // ==================================

        const reactions =
            await Reaction.find({
                message:
                    messageId
            });


        const counts = {};


        reactions.forEach(
            (reaction) => {

                counts[reaction.emoji] =
                    (
                        counts[
                            reaction.emoji
                        ] || 0
                    ) + 1;
            }
        );


        const userReaction =
            reactions.find(
                (reaction) =>
                    String(
                        reaction.user
                    ) ===
                    String(
                        req.userId
                    )
            );


        const result = {

            messageId:
                String(
                    messageId
                ),

            conversationId:
                String(
                    message.conversation
                ),

            counts,

            userReaction:
                userReaction
                    ?.emoji || null,

            action
        };


        // ==================================
        // SOCKET.IO
        // ==================================

        const io =
            req.app.get("io");


        if (io) {

            const roomName =
                `conversation:${message.conversation}`;


            io.to(
                roomName
            ).emit(
                "reaction-updated",
                result
            );


            console.log(
                "Reaction updated:",
                result
            );
        }


        return res.status(200).json({

            message:
                "Reaction updated",

            data:
                result
        });

    } catch (error) {

        console.error(
            "Toggle reaction error:",
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
    getMessageReactions,
    toggleReaction
};