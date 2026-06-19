/**
 * ELPay Payment Gateway Integration
 * Docs: https://docs.elpay.online
 * Base URL: https://api.elpay.online/int
 * Auth: HTTP Basic Auth (API Key : API Secret)
 */

const axios = require('axios');
const crypto = require('crypto');

class ELPayService {
  constructor() {
    this.apiKey = process.env.ELPAY_API_KEY;
    this.apiSecret = process.env.ELPAY_API_SECRET;
    this.baseURL = process.env.ELPAY_BASE_URL || 'https://api.elpay.online/int';
    this.webhookURL = process.env.ELPAY_WEBHOOK_URL;
  }

  /**
   * Generate HTTP Basic Auth header
   * Format: "Basic base64(apiKey:apiSecret)"
   * @returns {string} Authorization header value
   */
  generateBasicAuth() {
    const credentials = `${this.apiKey}:${this.apiSecret}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return `Basic ${base64Credentials}`;
  }

  /**
   * Make authenticated request to ELPay API
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint path
   * @param {object} data - Request data
   * @returns {Promise<object>} API response
   */
  async makeRequest(method, path, data = null) {
    const authorization = this.generateBasicAuth();

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${path}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
        },
        data,
      });

      return response.data;
    } catch (error) {
      console.error('ELPay API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: `${this.baseURL}${path}`,
      });
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'ELPay payment failed';
      throw new Error(errorMsg);
    }
  }

  /**
   * Create a new payment
   * Docs: https://docs.elpay.online/create-a-payment-33169847e0.md
   * Endpoint: POST /payment
   *
   * @param {object} params - Payment parameters
   * @param {string} params.userId - User ID
   * @param {string} params.email - User email
   * @param {string} params.name - User full name (first + last)
   * @param {number} params.amount - Payment amount in cents
   * @param {string} params.currency - Fiat currency (USD, EUR, GBP, CAD)
   * @param {string} params.description - Payment description
   * @param {object} params.metadata - Additional metadata
   * @param {string} params.country - User country code (ISO 3166-1 alpha-2, required)
   * @param {string} params.state - User state/province
   * @param {string} params.city - User city
   * @param {string} params.zip - User postal code
   * @param {string} params.phone - User phone number
   * @param {string} params.idempotencyKey - Unique key for idempotent requests
   * @returns {Promise<object>} Payment object with payment_url
   */
  async createPayment(params) {
    const {
      userId,
      email,
      name = 'User',
      amount,
      currency = 'USD',
      description = 'Payment',
      metadata = {},
      country = 'US',
      state = '',
      city = '',
      zip = '',
      phone = '',
      idempotencyKey = null,
      successUrl = '',
      cancelUrl = '',
    } = params;

    // Split name into first/last
    const nameParts = (name || 'User').trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const paymentData = {
      method: 'CARD',
      amount: parseInt(amount, 10),
      asset_id: currency.toUpperCase(),
      description,
      payer_first_name: firstName,
      payer_last_name: lastName,
      payer_email: email,
      payer_country: country.toUpperCase(),
      payer_lang: 'en',
      webhook_url: this.webhookURL,
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      timeout: 900,
      custom: JSON.stringify(metadata),
    };

    // Optional fields
    if (state) paymentData.payer_state = state;
    if (city) paymentData.payer_city = city;
    if (zip) paymentData.payer_zip = zip;
    if (phone) paymentData.payer_phone = phone;

    // Idempotency key (use order ID or generate UUID)
    if (idempotencyKey) {
      paymentData.idempotency_key = idempotencyKey;
    } else {
      paymentData.idempotency_key = `ORDER-${userId}-${Date.now()}`;
    }

    console.log('=== ELPAY PAYMENT REQUEST ===');
    console.log(JSON.stringify(paymentData, null, 2));
    console.log('=============================\n');

    const result = await this.makeRequest('POST', '/payment', paymentData);
    return result;
  }

  /**
   * Get payment details by ID
   * Docs: https://docs.elpay.online/get-payment-by-id-33169848e0.md
   * Endpoint: GET /payment/{paymentId}
   *
   * @param {string} paymentId - Payment ID
   * @returns {Promise<object>} Payment details
   */
  async getPayment(paymentId) {
    return await this.makeRequest('GET', `/payment/${paymentId}`);
  }

  /**
   * List available payment assets (currencies)
   * Docs: https://docs.elpay.online/list-available-assets-33169846e0.md
   * Endpoint: GET /assets
   *
   * @returns {Promise<object>} List of available assets
   */
  async getAssets() {
    return await this.makeRequest('GET', '/assets');
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Signature from webhook header (x-elpay-signature)
   * @param {object|string} payload - Webhook payload (raw body or object)
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    const payloadString =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payloadString)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Map ELPay status to internal status
   * ELPay statuses: CREATED, IN_PROGRESS, CLOSING, COMPLETED, CANCELED
   *
   * @param {string} status - ELPay status
   * @returns {string} Normalized status
   */
  normalizeStatus(status) {
    const statusMap = {
      CREATED: 'pending',
      IN_PROGRESS: 'pending',
      CLOSING: 'pending',
      COMPLETED: 'completed',
      COMPLETE: 'completed',
      CANCELED: 'canceled',
      CANCELLED: 'canceled',
      PAID: 'completed',
    };
    return statusMap[String(status || '').toUpperCase()] || 'pending';
  }
}

module.exports = new ELPayService();
