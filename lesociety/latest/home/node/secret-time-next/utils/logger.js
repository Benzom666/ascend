/**
 * Centralized logging utility
 * Automatically disabled in production mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // Always show warnings
    console.warn(...args);
  },
  
  error: (...args) => {
    // Always show errors
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  table: (data) => {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  },
};

export default logger;
