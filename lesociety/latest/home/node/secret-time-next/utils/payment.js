/**
 * Payment utility functions for ELPay integration
 */

import axios from 'axios';
import Cookies from 'js-cookie';
import { apiRequest, apiURL } from './Utilities';
import { loadFromLocalStorage } from './sessionStorage';
import { buildPaymentReturnDestination } from './paymentReturnState';

const API_URL = apiURL;

const getAuthToken = () => {
  const cookieToken = Cookies.get('token');
  if (cookieToken) {
    return cookieToken;
  }

  const authState = loadFromLocalStorage();
  return authState?.user?.token || '';
};

/**
 * Create a payment with ELPay
 * @param {object} params - Payment parameters
 * @param {number} params.amount - Payment amount
 * @param {string} params.currency - Currency code (default: USD)
 * @param {number} params.interested_tokens - Number of interested tokens to purchase
 * @param {number} params.super_interested_tokens - Number of super interested tokens to purchase
 * @returns {Promise<object>} Payment response with payment_url
 */
export const createPayment = async ({
  amount,
  currency = 'USD',
  interested_tokens = 0,
  super_interested_tokens = 0,
  metadata = {},
}) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_URL}/api/v1/payment/create`,
      {
        amount,
        currency,
        interested_tokens,
        super_interested_tokens,
        metadata,
        description: `Ascend Token Purchase - ${interested_tokens} Interested + ${super_interested_tokens} Super Interested`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create payment'
    );
  }
};

export const isCompletedPaymentStatus = (status) =>
  ['COMPLETED', 'COMPLETE', 'PAID'].includes(String(status || '').toUpperCase());

export const refreshAuthenticatedUser = async () => {
  const response = await apiRequest({
    method: 'GET',
    url: 'user/me',
  });

  return response?.data?.data?.user || null;
};

export const buildPostPaymentRedirectPath = ({
  returnContext = '',
  paymentId = '',
} = {}) => {
  return buildPaymentReturnDestination({
    status: 'success',
    returnContext,
    paymentId,
  });
};

export const redirectToPostPaymentHome = ({ returnContext = '' } = {}) => {
  if (typeof window !== 'undefined') {
    window.location.assign(
      buildPostPaymentRedirectPath({
        returnContext,
      })
    );
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<object>} Payment details
 */
export const getPayment = async (paymentId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(
      `${API_URL}/api/v1/payment/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Get payment error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to get payment'
    );
  }
};

/**
 * List user payments
 * @returns {Promise<object>} List of payments
 */
export const listPayments = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(
      `${API_URL}/api/v1/payment/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('List payments error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to list payments'
    );
  }
};

/**
 * Redirect to ELPay payment page
 * @param {string} paymentUrl - Payment URL from ELPay
 */
export const redirectToPayment = (paymentUrl) => {
  if (typeof window !== 'undefined') {
    window.location.href = paymentUrl;
  }
};
