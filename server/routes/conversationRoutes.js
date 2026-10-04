const express = require("express");

const {
    createOrGetConversation,
    getMyConversations
} = require("../controllers/conversationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Get all conversations
router.get(
    "/",
    protect,
    getMyConversations
);


// Create or get conversation
router.post(
    "/",
    protect,
    createOrGetConversation
);


module.exports = router;