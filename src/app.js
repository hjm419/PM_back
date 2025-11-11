// Express 앱의 '설정' (미들웨어, 라우터 연결)
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// 미들웨어 및 라우터 가져오기
const apiRouter = require("./api");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.handler");

// Express 앱 생성 및 설정
const app = express();

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 기본 엔드포인트
app.get("/", (req, res) => {
  res.json({ message: "✅ Kumoh PM Express API 서버가 실행 중입니다!" });
});

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API 라우터 연결
app.use("/api", apiRouter);

// 404 핸들러
app.use(notFoundHandler);

// 전역 에러 핸들러 (반드시 마지막)
app.use(errorHandler);

module.exports = app;
