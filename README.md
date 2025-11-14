````markdown
# 개인형 이동장치(PM) 관제 시스템 - 백엔드 (Kumoh PM Server)
앱은 아직 추가 X

본 프로젝트는 개인형 이동장치(PM) 관제 시스템의 백엔드 API 서버입니다. Express.js와 PostgreSQL을 기반으로 구축되었으며, 관리자 대시보드 및 사용자 앱에 필요한 RESTful API를 제공합니다.

## ✨ 주요 기능

* **인증 (Authentication)**: JWT(JSON Web Token)를 사용한 사용자 로그인 및 관리자 인증.
* **관리자 API (`/api/admin`)**:
    * 사용자 관리: 전체 사용자 조회, 상세 정보, 위험 이력 조회.
    * 기기 관리: 킥보드 등록, 조회, 수정, 삭제 및 원격 잠금.
    * 운행 관리: 전체 운행 이력, 상세 경로, 위험 로그 조회.
    * 통계: 대시보드 KPI, 차트 데이터 등 각종 통계 조회.
* **사용자 앱 API (`/api/app`)**:
    * 내 정보 관리, 회원가입.
    * 주변 킥보드 조회, 헬멧 인증.
    * 운행 시작 및 종료.
* **데이터베이스**: `node-postgres` (`pg`) 라이브러리를 통해 PostgreSQL 데이터베이스와 연동합니다.
* **위치 기반 서비스**: PostGIS를 활용한 킥보드 위치 저장 및 조회를 지원합니다 (Repository 계층 참고).

## 🛠️ 기술 스택

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (node-postgres `pg` 드라이버 사용)
* **Authentication**: JWT (`jsonwebtoken`)
* **Configuration**: `dotenv`
* **Middleware**: `cors`

## 📂 프로젝트 구조

본 프로젝트는 비즈니스 로직과 데이터 접근을 분리하는 **계층형 아키텍처(Layered Architecture)**를 따릅니다.

* **`PM_back/`**
    * **`src/`**
        * **`api/`**: API 라우트 정의 (Routes)
            * `admin/`: 관리자용 API
            * `app/`: 사용자 앱용 API
        * **`controllers/`**: 요청/응답 처리 (Controllers)
        * **`services/`**: 비즈니스 로직 (Services)
        * **`repository/`**: 데이터베이스 쿼리 (Repository)
        * **`models/`**: 데이터베이스 테이블 스키마 정의 (Models)
        * **`middleware/`**: 인증(auth) 및 오류(error) 미들웨어
        * **`config/`**: 데이터베이스 및 환경변수 설정
        * **`utils/`**: 공통 유틸리티 (API 응답, GIS 등)
        * `app.js`: Express 앱 설정 (미들웨어 연결)
        * `server.js`: 서버 실행 및 DB 연결 (Entry point)
    * `.env`: (필수) 환경변수 파일
    * `package.json`

## 🚀 시작하기

### 1. 환경변수 설정

프로젝트를 실행하기 위해 루트 디렉터리에 `.env` 파일을 생성하고, `PM_back/.env` 파일의 내용을 참고하여 데이터베이스 접속 정보 및 JWT 비밀 키를 설정해야 합니다.

```env
# 데이터베이스 연결 정보
DB_HOST= (예: 127.0.0.1 또는 DB 서버 IP)
DB_PORT=5432
DB_NAME= (예: kumoh_shared_db)
DB_USER= (예: kumoh_team)
DB_PASSWORD= (예: 1234)

# JWT 비밀 키 (필수)
JWT_SECRET= (예: your-very-secret-key-123)
JWT_EXPIRATION=24h

# 서버 포트 (선택사항, 기본 8080)
PORT=8080
````

### 2\. 의존성 설치

```bash
npm install
```

### 3\. 서버 실행

**개발 모드 (Nodemon 사용, 파일 변경 시 자동 재시작):**

```bash
npm run dev
```

**프로덕션 모드:**

```bash
npm run start
```

서버가 정상적으로 실행되면 터미널에 다음과 같은 메시지가 출력됩니다.

```
✅ 데이터베이스 연결 성공
✅ 서버가 http://localhost:8080 에서 실행 중입니다.
```

```
```
