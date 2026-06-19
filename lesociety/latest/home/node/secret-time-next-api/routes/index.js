const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

/* Health check endpoint */
router.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isMongoConnected ? 'ok' : 'degraded',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: isMongoConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
    uptime: process.uptime(),
  });
});

module.exports = router;
