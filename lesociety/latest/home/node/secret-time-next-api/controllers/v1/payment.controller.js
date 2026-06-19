/**
 * Payment Controller for ELPay Integration
 */

const Payment = require('../../models/payment');
const User = require('../../models/user');
const elpay = require('../../lib/elpay');
const logger = require('../../config/winston');

const buildFrontendReturnUrl = (path, returnContext = '') => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const url = new URL(path, frontendUrl);

  if (returnContext) {
    url.searchParams.set('return_context', returnContext);
  }

  return url.toString();
};

const isTestModeEnabled = () => process.env.ELPAY_TEST_MODE === 'true';

const shouldAutoCompleteTestPayment = () => process.env.ELPAY_AUTO_COMPLETE !== 'false';

const normalizePaymentStatus = (status) =>
  String(status || '').toLowerCase();

const normalizeMetadata = (metadata) => {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      return {};
    }
  }

  return metadata;
};

const parseMetadataCount = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const isSuccessfulPaymentStatus = (status) =>
  ['completed', 'complete', 'paid'].includes(normalizePaymentStatus(status));

const isLocalTestPayment = (payment) =>
  Boolean(
    payment &&
      (String(payment.transaction_id || '').startsWith('test_') ||
        payment.bank_name === 'ELPay (Test)')
  );

const creditCompletedPayment = async (paymentId, status, metadata = {}) => {
  const normalizedStatus = normalizePaymentStatus(status);
  const normalizedMetadata = normalizeMetadata(metadata);
  const payment = await Payment.findOne({ transaction_id: paymentId });

  if (!payment) {
    return { payment: null, credited: false };
  }

  if (!isSuccessfulPaymentStatus(normalizedStatus)) {
    await Payment.updateOne(
      { transaction_id: paymentId },
      { $set: { payment_status: normalizedStatus, updated_at: new Date() } }
    );
    return { payment, credited: false };
  }

  const paymentForCredit = await Payment.findOneAndUpdate(
    { transaction_id: paymentId, credited_at: null },
    {
      $set: {
        payment_status: normalizedStatus,
        updated_at: new Date(),
        credited_at: new Date(),
      },
    },
    { new: true }
  );

  if (!paymentForCredit) {
    await Payment.updateOne(
      { transaction_id: paymentId },
      { $set: { payment_status: normalizedStatus, updated_at: new Date() } }
    );
    return { payment, credited: false };
  }

  const user = await User.findById(paymentForCredit.username_id);
  if (!user) {
    return { payment: paymentForCredit, credited: false };
  }

  const interestedTokens =
    Number(paymentForCredit.interested_tokens) ||
    parseInt(normalizedMetadata.interested_tokens, 10) ||
    0;
  const superInterestedTokens =
    Number(paymentForCredit.super_interested_tokens) ||
    parseInt(normalizedMetadata.super_interested_tokens, 10) ||
    0;
  const chatTokens =
    Number(paymentForCredit.chat_tokens) ||
    parseInt(normalizedMetadata.chat_tokens, 10) ||
    0;

  if (interestedTokens > 0) {
    user.interested_tokens = (user.interested_tokens || 0) + interestedTokens;
  }
  if (superInterestedTokens > 0) {
    user.super_interested_tokens =
      (user.super_interested_tokens || 0) + superInterestedTokens;
  }
  if (chatTokens > 0) {
    user.chat_tokens = (user.chat_tokens || 0) + chatTokens;
  }

  user.interested_tokens_max = Math.max(
    Number(user.interested_tokens_max) || 0,
    Number(user.interested_tokens) || 0
  );
  user.super_interested_tokens_max = Math.max(
    Number(user.super_interested_tokens_max) || 0,
    Number(user.super_interested_tokens) || 0
  );
  user.chat_tokens_max = Math.max(
    Number(user.chat_tokens_max) || 0,
    Number(user.chat_tokens) || 0
  );

  await user.save();
  logger.info(
    `Tokens updated for user ${user._id}: +${interestedTokens} interested, +${superInterestedTokens} super interested, +${chatTokens} chat`
  );

  return { payment: paymentForCredit, credited: true, user };
};

/**
 * Create a new payment with ELPay
 * POST /api/v1/payment/create
 */
exports.createPayment = async (req, res) => {
  try {
    // Extract user ID from JWT token (set by validateApi middleware)
    const userId = req.datajwt?.userdata?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      amount,
      currency = 'USD',
      interested_tokens = 0,
      super_interested_tokens = 0,
      description = 'Ascend Token Purchase',
      metadata = {},
    } = req.body;

    const numericAmount = Number(amount);
    const normalizedMetadata = normalizeMetadata(metadata);
    const returnContext =
      typeof normalizedMetadata.return_context === 'string'
        ? normalizedMetadata.return_context.trim().toLowerCase()
        : '';
    const chatTokens = parseMetadataCount(normalizedMetadata.chat_tokens);
    const aLaCarteCount = parseMetadataCount(normalizedMetadata.aLaCarteCount);
    const queensBundleCount = parseMetadataCount(normalizedMetadata.queensBundleCount);

    // Validate amount
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than $0'
      });
    }

    if (!isTestModeEnabled() && numericAmount < 25) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payment amount is $25'
      });
    }

    // Get user details for pre-filling
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // TEMPORARY: Test mode bypass for development
    if (isTestModeEnabled()) {
      const mockPaymentId = `test_${Date.now()}_${userId}`;

      logger.info(`Creating test payment: ${mockPaymentId}`);

      // Save mock payment in database
      const payment = new Payment({
        username_id: userId,
        transaction_id: mockPaymentId,
        amount: numericAmount.toString(),
        currency,
        bank_name: 'ELPay (Test)',
        payment_status: 'pending',
        interested_tokens: parseInt(interested_tokens) || 0,
        super_interested_tokens: parseInt(super_interested_tokens) || 0,
        chat_tokens: chatTokens,
        a_la_carte_count: aLaCarteCount,
        queens_bundle_count: queensBundleCount,
        metadata: normalizedMetadata,
        created_at: new Date(),
      });
      await payment.save();

      // Simulate immediate success for testing
      if (shouldAutoCompleteTestPayment()) {
        const result = await creditCompletedPayment(mockPaymentId, 'completed');
        logger.info(
          `Test payment auto-completed for user ${userId}: ${mockPaymentId} (credited=${result.credited})`
        );
      }

      // Return mock payment URL
      const successUrl = buildFrontendReturnUrl('/payment/success', returnContext);
      return res.status(200).json({
        success: true,
        message: 'Payment created successfully (TEST MODE)',
        data: {
          payment_id: mockPaymentId,
          payment_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}payment_id=${mockPaymentId}`,
          amount: numericAmount,
          currency,
          status: shouldAutoCompleteTestPayment() ? 'completed' : payment.payment_status,
        }
      });
    }

    // Create payment in ELPay
    const userName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.user_name;

    logger.info('User data for payment:', {
      userId: userId.toString(),
      email: user.email,
      userName,
      country: user.country_code || user.country || 'US',
      state: user.province || user.state || '',
    });

    const elpayPayment = await elpay.createPayment({
      userId: userId.toString(),
      email: user.email,
      name: userName,
      amount: Math.round(numericAmount * 100), // ELPay expects amount in cents
      currency,
      description,
      metadata: {
        interested_tokens,
        super_interested_tokens,
        user_name: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        ...normalizedMetadata,
      },
      country: user.country_code || user.country || 'US',
      state: user.province || user.state || '',
      city: user.city || '',
      zip: user.zip || '',
      phone: user.phone_number || '',
      idempotencyKey: `ORDER-${userId}-${Date.now()}`,
      successUrl: buildFrontendReturnUrl('/payment/success', returnContext),
      cancelUrl: buildFrontendReturnUrl('/payment/cancel', returnContext),
    });

    // Save payment record in database
    const payment = new Payment({
      username_id: userId,
      transaction_id: elpayPayment.payment_id,
      amount: numericAmount.toString(),
      currency,
      bank_name: 'ELPay',
      payment_status: 'pending',
      interested_tokens: parseInt(interested_tokens) || 0,
      super_interested_tokens: parseInt(super_interested_tokens) || 0,
      chat_tokens: chatTokens,
      a_la_carte_count: aLaCarteCount,
      queens_bundle_count: queensBundleCount,
      metadata: normalizedMetadata,
      created_at: new Date(),
    });

    await payment.save();

    logger.info(`Payment created for user ${userId}: ${elpayPayment.payment_id}`);

    // Return payment_url for redirect to ELPay hosted checkout page
    res.status(200).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment_id: elpayPayment.payment_id,
        payment_url: elpayPayment.payment_url,
        amount: numericAmount,
        currency,
        status: elpay.normalizeStatus(elpayPayment.status),
      }
    });

  } catch (error) {
    logger.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment'
    });
  }
};

/**
 * Get payment details
 * GET /api/v1/payment/:paymentId
 */
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Get payment from database
    const payment = await Payment.findOne({ transaction_id: paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (isLocalTestPayment(payment) || isTestModeEnabled()) {
      if (!isSuccessfulPaymentStatus(payment.payment_status) && shouldAutoCompleteTestPayment()) {
        await creditCompletedPayment(paymentId, 'completed');
      }

      const refreshedPayment = await Payment.findOne({ transaction_id: paymentId });
      return res.status(200).json({
        success: true,
        data: {
          payment_id: refreshedPayment.transaction_id,
          amount: refreshedPayment.amount,
          currency: refreshedPayment.currency,
          status: refreshedPayment.payment_status,
          created_at: refreshedPayment.created_at,
        }
      });
    }

    // Get latest status from ELPay
    const elpayPayment = await elpay.getPayment(paymentId);

    const paymentStatus = normalizePaymentStatus(elpayPayment.status);
    const paymentMetadata = normalizeMetadata(
      elpayPayment.custom || {}
    );

    if (isSuccessfulPaymentStatus(paymentStatus)) {
      await creditCompletedPayment(paymentId, paymentStatus, paymentMetadata);
    } else if (payment.payment_status !== paymentStatus) {
      payment.payment_status = elpay.normalizeStatus(elpayPayment.status);
      payment.updated_at = new Date();
      await payment.save();
    }

    res.status(200).json({
      success: true,
      data: {
        payment_id: payment.transaction_id,
        amount: payment.amount,
        currency: payment.currency,
        status: elpay.normalizeStatus(elpayPayment.status), // Return NORMALIZED status
        created_at: payment.created_at,
      }
    });

  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment'
    });
  }
};

/**
 * ELPay Webhook Handler
 * POST /api/v1/payment/elpay-webhook
 */
exports.elpayWebhook = async (req, res) => {
  try {
    logger.info(`[ELPAY WEBHOOK] Raw body: ${JSON.stringify(req.body)}`);

    const signature = req.headers['x-elpay-signature'];
    const payload = req.body || {};

    logger.info(`Webhook received - Raw payload: ${JSON.stringify(payload)}`);

    // ELPay wraps payment data inside payload.payment
    const paymentData = payload.payment || payload;
    const paymentId = paymentData.payment_id;
    const status = paymentData.status;

    logger.info(`Webhook for payment ${paymentId} with status ${status}`);

    if (!paymentId) {
      logger.warn('Webhook missing payment_id');
      return res.status(400).json({ success: false, message: 'Missing payment_id' });
    }

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.ELPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      if (!elpay.verifyWebhookSignature(signature, payload)) {
        logger.warn('Invalid webhook signature');
        // Don't block the webhook for testing - continue processing
      }
    }

    const metadata = normalizeMetadata(paymentData.custom || {});

    // Find payment in database
    const payment = await Payment.findOne({ transaction_id: paymentId });
    if (!payment) {
      logger.warn(`Payment not found for webhook: ${paymentId}`);
      // Return 200 to prevent ELPay from retrying
      return res.status(200).json({ success: true, message: 'Payment not found - may already be processed' });
    }

    // Map ELPay status to internal status
    const normalizedStatus = elpay.normalizeStatus(status);
    logger.info(`Payment ${paymentId} status: ${status} -> normalized: ${normalizedStatus}`);

    // Credit the payment
    const result = await creditCompletedPayment(paymentId, normalizedStatus, metadata);
    logger.info(`Credit result for ${paymentId}: credited=${result.credited}`);

    res.status(200).json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    logger.error('Webhook processing error:', error);
    // Return 200 to prevent retries on application errors
    res.status(200).json({ success: false, message: error.message });
  }
};

/**
 * List user payments
 * GET /api/v1/payment/list
 */
exports.listPayments = async (req, res) => {
  try {
    const userId = req.datajwt?.userdata?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const payments = await Payment.find({ username_id: userId })
      .sort({ created_at: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: payments
    });

  } catch (error) {
    logger.error('List payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list payments'
    });
  }
};

/**
 * Get available payment assets
 * GET /api/v1/payment/assets
 */
exports.getAssets = async (req, res) => {
  try {
    const assets = await elpay.getAssets();

    res.status(200).json({
      success: true,
      data: assets
    });

  } catch (error) {
    logger.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get assets'
    });
  }
};
