const express = require("express");
const validateApi = require("../helpers/validateApi");
const requireAdmin = require("../helpers/requireAdmin");
const adminConsoleController = require("../controllers/v1/admin-console");

const router = express.Router();

// All routes are admin-protected. Reads are oversight; the message POST sends on behalf of a profile.
router.use(validateApi, requireAdmin);

router.get("/profiles", adminConsoleController.listProfiles);
router.get("/profiles/:id", adminConsoleController.getProfileOverview);
router.get("/profiles/:id/requests", adminConsoleController.getProfileRequests);
router.get("/profiles/:id/chatrooms", adminConsoleController.getProfileChatRooms);
router.get("/chatrooms/:roomId/messages", adminConsoleController.getChatRoomMessages);
router.post("/chatrooms/:roomId/messages", adminConsoleController.sendOperatorMessage);

module.exports = router;
