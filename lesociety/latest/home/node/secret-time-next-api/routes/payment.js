/**
 * Payment Routes for ELPay Integration
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/v1/payment.controller');
const validateApi = require('../helpers/validateApi');

/**
 * @route   POST /api/v1/payment/create
 * @desc    Create a new payment with ELPay
 * @access  Private
 */
router.post('/create', validateApi, paymentController.createPayment);

/**
 * @route   GET /api/v1/payment/assets
 * @desc    Get available payment assets (currencies)
 * @access  Public
 */
router.get('/assets', paymentController.getAssets);

/**
 * @route   GET /api/v1/payment/list
 * @desc    List user payments
 * @access  Private
 */
router.get('/list', validateApi, paymentController.listPayments);

/**
 * @route   GET /api/v1/payment/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:paymentId', validateApi, paymentController.getPayment);

/**
 * @route   POST /api/v1/payment/elpay-webhook
 * @desc    ELPay webhook handler (public endpoint)
 * @access  Public (webhook)
 */
router.post('/elpay-webhook', paymentController.elpayWebhook);

/**
 * DEV ONLY: Manually credit a payment for testing
 * POST /api/v1/payment/test-credit
 */
router.post('/test-credit', async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId required' });
  
  const Payment = require('../models/payment');
  const User = require('../models/user');
  
  try {
    const payment = await Payment.findOne({ transaction_id: paymentId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    
    const user = await User.findById(payment.username_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const interested = parseInt(payment.interested_tokens) || 0;
    const superInterested = parseInt(payment.super_interested_tokens) || 0;
    const chat = parseInt(payment.chat_tokens) || 0;
    
    if (interested > 0) user.interested_tokens = (user.interested_tokens || 0) + interested;
    if (superInterested > 0) user.super_interested_tokens = (user.super_interested_tokens || 0) + superInterested;
    if (chat > 0) user.chat_tokens = (user.chat_tokens || 0) + chat;
    await user.save();
    
    payment.payment_status = 'completed';
    payment.credited_at = new Date();
    await payment.save();
    
    res.status(200).json({ 
      success: true, 
      credited: { interested, superInterested, chat },
      userTokens: { 
        interested_tokens: user.interested_tokens, 
        super_interested_tokens: user.super_interested_tokens, 
        chat_tokens: user.chat_tokens 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;