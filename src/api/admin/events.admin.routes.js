// PM_back/src/api/admin/events.admin.routes.js

const express = require("express");
const router = express.Router();

// (가정) stats.controller.js 에 이벤트 로그 컨트롤러를 추가
const statsController = require("../../controllers/stats.controller");

// v1.3 명세서 7번: GET /api/ad min/events
// (참고: 프론트엔드 EventLogTab.vue가 이 API를 호출합니다)
router.get("/", statsController.getEventLogs); // getEventLogs 컨트롤러 필요

module.exports = router;