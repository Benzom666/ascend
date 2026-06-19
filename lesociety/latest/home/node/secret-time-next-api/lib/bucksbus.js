/**
 * BucksBus Payment Gateway Integration
 * Docs: https://docs.bucksbus.com
 * Base URL: https://api.bucksbus.com/int
 * Auth: HTTP Basic Auth
 */

const axios = require('axios');
const crypto = require('crypto');

class BucksBusService {
  constructor() {
    this.apiKey = process.env.BUCKSBUS_API_KEY;
    this.apiSecret = process.env.BUCKSBUS_API_SECRET;
    this.baseURL = process.env.BUCKSBUS_BASE_URL || 'https://api.bucksbus.com/int';
    this.webhookURL = process.env.BUCKSBUS_WEBHOOK_URL;
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
   * Make authenticated request to BucksBus API
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
      console.error('BucksBus API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: `${this.baseURL}${path}`,
      });
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'BucksBus payment failed';
      throw new Error(errorMsg);
    }
  }

  buildFiatPaymentData({
    userId,
    email,
    name,
    amount,
    currency,
    description,
    metadata,
    country,
    state,
    provider,
    successUrl,
    cancelUrl,
  }) {
    const paymentData = {
      payment_type: 'FIXED_AMOUNT',
      amount: parseFloat(amount),
      asset_id: currency.toUpperCase(),
      payment_asset_id: process.env.BUCKSBUS_CRYPTO_ASSET || 'BTC',
      payer_email: email,
      payer_name: name,
      payer_lang: 'en',
      fiat_asset_id: currency.toUpperCase(),
      reverse: 'REVERSE',
      country: country.toUpperCase() || 'US',
      state: state.toUpperCase() || 'CA',
      webhook_url: this.webhookURL,
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      fail_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      order_id: `ORDER-${userId}-${Date.now()}`,
      description,
      custom: JSON.stringify(metadata),
    };

    if (provider) {
      paymentData.fiat_provider = provider;
    }

    return paymentData;
  }

  /**
   * Create a reverse fiat payment with direct provider redirect
   * Supports automatic fallback to alternative providers if primary is down
   * Docs: https://docs.bucksbus.com/create-fiat-payment-18549072e0.md
   * Endpoint: POST /payment/fiat
   * 
   * @param {object} params - Payment parameters
   * @param {string} params.userId - User ID
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {number} params.amount - Payment amount
   * @param {string} params.currency - Fiat currency (USD, EUR, etc.)
   * @param {string} params.description - Payment description
   * @param {object} params.metadata - Additional metadata
   * @param {string} params.country - User country code (required)
   * @param {string} params.state - User state/province (required)
   * @param {string} params.provider - Payment provider (topper, moonpay, etc.)
   * @param {boolean} params.allowProviderFallback - Whether to silently try other providers
   * @returns {Promise<object>} Payment object with payment_url to provider
   */
  async createFiatPayment(params) {
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
      provider = 'transak',
      allowProviderFallback = true,
      successUrl = '',
      cancelUrl = '',
    } = params;

    // Provider fallback list (in order of preference)
    // IMPORTANT: Never use null! It causes BucksBus to show selection page
    // Always specify a provider to skip the intermediary page
    // Priority: Transak > Banxa > MoonPay
    const providerFallbacks = [
      'transak',
      'banxa',
      'moonpay',
    ];

    // If a provider is requested, try it first and then fall back to the allowed defaults.
    const normalizedProvider = (provider || 'transak').toLowerCase();
    const providersToTry = allowProviderFallback
      ? [
          normalizedProvider,
          ...providerFallbacks.filter((item) => item !== normalizedProvider),
        ]
      : [normalizedProvider];

    // Try each provider in fallback list until one works
    let lastError = null;
    
    for (const currentProvider of providersToTry) {
      try {
        console.log(`\n🔄 Trying provider: ${currentProvider}`);
        const paymentData = this.buildFiatPaymentData({
          userId,
          email,
          name,
          amount,
          currency,
          description,
          metadata,
          country,
          state,
          provider: currentProvider,
          successUrl,
          cancelUrl,
        });

        console.log('=== BUCKSBUS PAYMENT REQUEST ===');
        console.log(JSON.stringify(paymentData, null, 2));
        console.log('================================\n');

        const result = await this.makeRequest('POST', '/payment/fiat', paymentData);
        const returnedProvider = (result?.fund_provider_name || '').toLowerCase();

        if (
          currentProvider &&
          returnedProvider &&
          returnedProvider !== currentProvider.toLowerCase()
        ) {
          throw new Error(
            `BucksBus returned ${returnedProvider} while ${currentProvider} was requested`
          );
        }
        
        console.log(`✅ SUCCESS with provider: ${currentProvider}\n`);
        return result;

      } catch (error) {
        console.log(`❌ FAILED with provider ${currentProvider}: ${error.message}`);
        lastError = error;

        // If this is the last provider, throw the error
        if (currentProvider === providersToTry[providersToTry.length - 1]) {
          throw lastError;
        }
        
        // Otherwise, continue to next provider
        console.log(`   Trying next provider...`);
      }
    }

    try {
      console.log('\n🔄 All direct providers failed, falling back to BucksBus onramp selection page');

      const onrampPaymentData = this.buildFiatPaymentData({
        userId,
        email,
        name,
        amount,
        currency,
        description,
        metadata,
        country,
        state,
        provider: null,
        successUrl,
        cancelUrl,
      });

      const onrampResult = await this.makeRequest('POST', '/payment/fiat', onrampPaymentData);
      console.log('✅ SUCCESS with generic BucksBus onramp page\n');
      return onrampResult;
    } catch (onrampError) {
      throw lastError || onrampError || new Error('All payment providers failed');
    }
  }

  /**
   * Get available payment providers
   * Docs: https://docs.bucksbus.com (Providers schema)
   * 
   * @param {object} params - Filter parameters
   * @param {string} params.country - Country code to filter providers
   * @param {string} params.currency - Currency to filter providers
   * @returns {Promise<object>} List of available providers
   */
  async getProviders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const path = `/api/v1/providers${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest('GET', path);
  }

  /**
   * Get payment details
   * Docs: https://docs.bucksbus.com/payment-details-18549868e0.md
   * 
   * @param {string} paymentId - Payment ID
   * @returns {Promise<object>} Payment details
   */
  async getPayment(paymentId) {
    return await this.makeRequest('GET', `/api/v1/payments/${paymentId}`);
  }

  /**
   * List payments
   * Docs: https://docs.bucksbus.com/list-payments-18549255e0.md
   * 
   * @param {object} params - Query parameters
   * @returns {Promise<object>} List of payments
   */
  async listPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const path = `/api/v1/payments${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest('GET', path);
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Signature from webhook header
   * @param {object} payload - Webhook payload
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

module.exports = new BucksBusService();
