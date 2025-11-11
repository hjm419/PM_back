// 일관된 API 응답 포맷
/**
 * 성공 응답
 * @param {object} data
 * @param {string} message
 * @param {number} statusCode
 * @returns {object}
 */
const success = (data, message = "Success", statusCode = 200) => {
  return {
    success: true,
    status: statusCode,
    message,
    data,
  };
};

/**
 * 에러 응답
 * @param {string} message
 * @param {number} statusCode
 * @param {object} error
 * @returns {object}
 */
const error = (message, statusCode = 500, error = {}) => {
  return {
    success: false,
    status: statusCode,
    message,
    error,
  };
};

/**
 * 페이징 응답
 * @param {array} data
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 * @returns {object}
 */
const paginated = (data, page, limit, total) => {
  return {
    success: true,
    status: 200,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  success,
  error,
  paginated,
};
