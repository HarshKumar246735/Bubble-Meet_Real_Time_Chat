const express = require("express");

const {
    getMessageReactions,
    toggleReaction
} = require("../controllers/reactionController");

const protect =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// Get reactions for message

router.get(
    "/:messageId",
    protect,
    getMessageReactions
);


// Add / update / remove reaction

router.post(
    "/:messageId",
    protect,
    toggleReaction
);


module.exports =
    router;