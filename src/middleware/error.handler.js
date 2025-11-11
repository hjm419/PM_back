// 전역 에러 처리
/**
 * 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ 에러:", err);

  // 기본 에러 응답
  const status = err.status || 500;
  const message = err.message || "서버 에러가 발생했습니다";

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

/**
 * 404 핸들러
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: "요청한 리소스를 찾을 수 없습니다",
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
