// .env 파일에서 변수를 읽어오기 위해 dotenv 설정
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// 이 pool 객체를 다른 파일에서 가져다 쓸 수 있도록 export
module.exports = pool;