const express = require("express");

const {
    editMessage,
    deleteMessage
} = require("../controllers/messageActionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// EDIT MESSAGE
// ==========================================

router.patch(
    "/:messageId",
    protect,
    editMessage
);


// ==========================================
// DELETE MESSAGE
// ==========================================

router.delete(
    "/:messageId",
    protect,
    deleteMessage
);


module.exports = router;