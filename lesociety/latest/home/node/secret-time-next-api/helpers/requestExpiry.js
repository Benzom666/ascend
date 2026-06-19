/**
 * Helper to auto-expire pending requests after 48 hours
 * Changes status from 0 (pending) to 3 (ignored) and triggers refund
 */

const Requests = require('../models/requests');
const User = require('../models/user');
const winstonLog = require('../config/winston');

/**
 * Check and expire all pending requests past 48 hours
 */
async function expireOldRequests() {
  try {
    const now = new Date();
    
    // Find all pending requests (status 0) where expires_at has passed
    const expiredRequests = await Requests.find({
      status: 0,
      expires_at: { $lte: now }
    });
    
    if (expiredRequests.length === 0) {
      winstonLog.info('No requests to expire');
      return { expired: 0 };
    }
    
    winstonLog.info(`Found ${expiredRequests.length} expired requests to process`);
    
    let refundedCount = 0;
    let expiredCount = 0;

    for (const request of expiredRequests) {
      const shouldRefund = !request.is_refunded;
      if (shouldRefund) {
        const tokenField =
          request.request_type === "super_interested"
            ? "super_interested_tokens"
            : "interested_tokens";

        const userUpdated = await User.findOneAndUpdate(
          { email: request.requester_id },
          { $inc: { [tokenField]: 1 }, $set: { updated_at: now } },
          { new: true }
        );

        if (userUpdated) {
          request.is_refunded = true;
          refundedCount += 1;
        } else {
          winstonLog.warn(
            `Failed to refund request token. User not found for requester email: ${request.requester_id}`
          );
        }
      }

      request.status = 3;
      request.update_date = now;
      await request.save();
      expiredCount += 1;
    }

    winstonLog.info(
      `Expired ${expiredCount} requests. Refunded ${refundedCount} request tokens.`
    );
    
    return {
      expired: expiredCount,
      refunded: refundedCount,
      requests: expiredRequests
    };
    
  } catch (error) {
    winstonLog.error('Error expiring old requests:', error);
    throw error;
  }
}

/**
 * Start the expiry checker - runs every hour
 */
function startExpiryChecker() {
  // Run immediately on startup
  expireOldRequests().catch(err => {
    winstonLog.error('Failed initial request expiry check:', err);
  });
  
  // Then run every hour
  const HOUR_IN_MS = 60 * 60 * 1000;
  setInterval(() => {
    expireOldRequests().catch(err => {
      winstonLog.error('Failed scheduled request expiry check:', err);
    });
  }, HOUR_IN_MS);
  
  winstonLog.info('Request expiry checker started (runs every hour)');
}

module.exports = {
  expireOldRequests,
  startExpiryChecker
};
