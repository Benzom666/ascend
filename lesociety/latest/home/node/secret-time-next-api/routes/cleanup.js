const express = require('express');
const router = express.Router();
const cleanupController = require('../controllers/v1/cleanup');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/before-2025', asyncHandler(cleanupController.cleanupBefore2025));

module.exports = router;
