const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
    createChatSession,
    getMyChatSessions,
    sendMessage,
    renameChatSession,
    deleteChatSession,
} = require("../controllers/chatController");

const router = express.Router();


// =====================================
// Create Chat Session
// =====================================

router.post(
    "/sessions",
    authMiddleware,
    createChatSession
);


// =====================================
// Get My Chat Sessions
// =====================================

router.get(
    "/sessions",
    authMiddleware,
    getMyChatSessions
);


// =====================================
// Rename Chat Session
// =====================================

router.patch(
    "/sessions/:id",
    authMiddleware,
    renameChatSession
);


// =====================================
// Delete Chat Session
// =====================================

router.delete(
    "/sessions/:id",
    authMiddleware,
    deleteChatSession
);


// =====================================
// Send Chat Message
// =====================================

router.post(
    "/messages",
    authMiddleware,
    sendMessage
);


module.exports = router;