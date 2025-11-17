// src/services/ai.service.js
const axios = require("axios");
const FormData = require("form-data");

class AiService {
  /**
   * AI 서버로 헬멧 인증 요청
   * @param {Buffer} fileBuffer - 이미지 파일 바이너리
   * @param {string} filename - 파일명
   */
  async checkHelmet(fileBuffer, filename) {
    try {
      // 1. 파이썬 서버로 보낼 데이터 준비
      const formData = new FormData();
      formData.append("file", fileBuffer, filename);
      console.log("AI 서버로 헬멧 인증 요청 전송");
      // 2. 파이썬 FastAPI 서버 주소 (로컬 기준)
      const AI_URL = "http://127.0.0.1:8000/predict";
      console.log("AI 서버 URL:", AI_URL);
      // 3. 요청 전송
      const response = await axios.post(AI_URL, formData, {
        headers: {
          ...formData.getHeaders(), // 중요: Content-Type 자동 설정
        },
      });
      console.log("AI 서버 응답 수신:", response.data);
      return response.data; // 파이썬 서버가 준 JSON 결과 반환
    } catch (error) {
      console.error("AI Server 통신 오류:", error.message);
      // AI 서버가 꺼져있거나 오류가 나도 백엔드가 죽지 않게 처리
      throw new Error("AI 인증 서버와 연결할 수 없습니다.");
    }
  }
}

module.exports = new AiService();
