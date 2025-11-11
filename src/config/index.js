// .env 파일에서 환경 변수 로드
require("dotenv").config();

module.exports = {
  // 서버 설정
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",

  // 데이터베이스 설정
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 5432,
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "password",
    DATABASE: process.env.DB_NAME || "kumoh_pm",
  },

  // JWT 설정
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "24h",

  // 지도 API 설정
  MAP_API_KEY: process.env.MAP_API_KEY || "",

  // 기타 설정
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};
