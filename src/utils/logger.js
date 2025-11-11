// 로깅 유틸리티
const fs = require("fs");
const path = require("path");

// 로그 디렉토리 생성
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * 로그 메시지 출력
 * @param {string} level: 'INFO', 'WARN', 'ERROR'
 * @param {string} message
 * @param {object} data
 */
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message} ${JSON.stringify(
    data
  )}`;

  console.log(logMessage);

  // 로그 파일에 저장
  const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
  fs.appendFileSync(logFile, logMessage + "\n");
};

module.exports = {
  info: (message, data) => log("INFO", message, data),
  warn: (message, data) => log("WARN", message, data),
  error: (message, data) => log("ERROR", message, data),
};
