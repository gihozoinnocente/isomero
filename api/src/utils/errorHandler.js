/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {string[]} details - Optional error details
 * @param {number} status - HTTP status code
 * @returns {Object} - Error response object
 */
const formatError = (message, details = [], status = 400) => ({
  success: false,
  error: {
    message,
    details,
    status
  }
});

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string[]} details - Optional error details
 * @param {number} status - HTTP status code
 */
const sendError = (res, message, details = [], status = 400) => {
  res.status(status).json(formatError(message, details, status));
};

module.exports = {
  formatError,
  sendError
};
