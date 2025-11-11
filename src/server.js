// 앱 '실행' (DB 연결, app.listen)
// app.js 에서 설정된 Express 앱을 실행

require("dotenv").config();
const app = require("./app");
const config = require("./config");
const db = require("./config/db");

const PORT = config.PORT;

// DB 연결 테스트 (선택사항)
db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ 데이터베이스 연결 실패:", err);
  } else {
    console.log("✅ 데이터베이스 연결 성공");
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`\n✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📝 환경: ${config.NODE_ENV}\n`);
});

// 우아한 종료 (graceful shutdown)
process.on("SIGINT", () => {
  console.log("\n⏹️  서버 종료 중...");
  db.end();
  process.exit(0);
});
