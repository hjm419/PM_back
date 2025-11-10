// .env 파일의 변수들을 맨 위에 로드
require('dotenv').config();

// 라이브러리 가져오기
const express = require('express');
const cors = require('cors');

// Express 앱 생성 및 설정
const app = express();
const PORT = 8080; // 8080번 포트로 서버를 엽니다.

app.use(cors()); // 모든 CORS 요청 허용
app.use(express.json()); // JSON 요청 본문(body)을 자동으로 파싱

// 라우터 파일들 불러오기
const authRoutes = require('./src/api/auth.routes');
// const kickboardRoutes = require('./src/api/kickboard.routes');
// const dangerRoutes = require('./src/api/danger.routes');


// API 엔드포인트 연결
app.get('/', (req, res) => {
    res.send('Kumoh PM Express API 서버가 실행 중입니다!');
});

// "/auth" 경로로 오는 요청은 authRoutes 파일이 처리
app.use('/auth', authRoutes);
// app.use('/kickboards', kickboardRoutes); // (나중에 주석 해제)
// app.use('/danger', dangerRoutes);       // (나중에 주석 해제)


// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});