const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");

const { isLoggedIn, isOwner } = require("../middleware/auth");

// Owner inbox
router.get(
  "/owner/inbox",
  isLoggedIn,
  isOwner,
  messageController.ownerInbox
);

// Chat room
router.get(
  "/chat/:rentalId/:receiverId",
  isLoggedIn,
  messageController.chatRoom
);

module.exports = router;