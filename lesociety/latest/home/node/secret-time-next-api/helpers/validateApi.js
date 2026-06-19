/**
 * API Authentication Middleware
 * SECURITY FIX: Use centralized auth service for token verification
 */

const helper = require('./helper');
const authService = require('../lib/auth');

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json(helper.errorResponse([], 403, 'No credentials sent!'));
  }

  let token = req.headers.authorization;
  token = token.replace('Bearer ', '').trim();
  
  try {
    // Use centralized auth service for verification
    const decoded = authService.verifyAccessToken(token);
    
    // CRITICAL FIX: Normalize token payload for backward compatibility
    // New auth service uses { userId, email, role, gender }
    // Old controllers expect { userdata: { _id, user_name, ... } }
    
    if (decoded.userId && !decoded.userdata) {
      // New token format - fetch full user data from database
      const User = require('../models/user');
      const userDoc = await User.findById(decoded.userId).lean();
      
      if (!userDoc) {
        return res.status(401).json(helper.errorResponse([], 401, 'User not found!'));
      }
      
      // Transform to old format
      req.datajwt = {
        userdata: {
          _id: userDoc._id,
          user_name: userDoc.user_name,
          email: userDoc.email,
          gender: userDoc.gender,
          role: userDoc.role,
          country_code: userDoc.country_code,
          location: userDoc.location,
          province: userDoc.province,
          blocked_users_by_self: userDoc.blocked_users_by_self || [],
          blocked_by_others: userDoc.blocked_by_others || []
        }
      };
      req.user = req.datajwt.userdata;
    } else {
      // Old token format - use as is
      req.datajwt = decoded;
      req.user = decoded.userdata || decoded;
    }
    
    next();
  } catch (error) {
    // Handle specific error types
    if (error.message === 'Token expired') {
      return res.status(401).json(helper.errorResponse([], 401, 'Token expired. Please login again.'));
    } else if (error.message === 'Invalid token') {
      return res.status(401).json(helper.errorResponse([], 401, 'Invalid token!'));
    }
    
    return res.status(401).json(helper.errorResponse([], 401, 'Failed to authenticate token!'));
  }
};
