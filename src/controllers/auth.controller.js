// 3단계에서 만든 DB 연결(Pool) 객체를 가져옵니다.
const pool = require('../config/db.config');

// 로그인 로직
const login = async (req, res) => {
    // 1. 프론트엔드가 보낸 ID/PW 받기
    const { login_id, user_pw } = req.body;

    console.log(`### Express 백엔드가 받은 로그인 값: ${login_id}`);

    // 2. DB 쿼리 실행 (암호화 안 된 비밀번호 기준)
    // (참고: 실제 서비스에서는 user_pw도 암호화해서 비교해야 합니다)
    const sql = 'SELECT * FROM t_user WHERE login_id = $1 AND user_pw = $2';

    try {
        const result = await pool.query(sql, [login_id, user_pw]);

        if (result.rows.length > 0) {
            // 3-1. (로그인 성공) DB에서 찾은 사용자 정보를 'result' 객체에 담아 전송
            // (기존 Spring 템플릿과 동일하게 { "result": ... } 형태로 보냅니다)
            res.json({ result: result.rows[0] });
        } else {
            // 3-2. (로그인 실패) DB에 일치하는 사용자가 없음
            res.json({ result: null });
        }
    } catch (err) {
        // 3-3. (DB 에러) "t_user" 테이블이 없다거나 DB 연결이 끊겼을 때
        console.error('DB 쿼리 에러:', err);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
};

// register, getMe 함수 등... (나중에 추가)

// 이 함수들을 다른 파일에서 쓸 수 있게 export
module.exports = {
    login,
    // register,
    // getMe
};