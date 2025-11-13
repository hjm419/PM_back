// 이벤트 로그 모델 (T_EVENT_LOG 데이터 스키마)

/**
 * (가정) T_EVENT_LOG 테이블 스키마 정의
 *
 * CREATE TABLE t_event_log (
 * log_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid(),
 * "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 * type VARCHAR(50) NOT NULL,
 * detail TEXT,
 * related_user_id BIGINT REFERENCES t_user(user_id), -- (★타입이 BIGINT임)
 * related_pm_id VARCHAR(50) REFERENCES t_kickboard(pm_id)
 * );
 */

class EventLog {
    /**
     * EventLog 스키마 필드 정의 (명세서 기반)
     */
    static schema = {
        log_id: { type: String, primaryKey: true, description: "로그 ID" },
        timestamp: { type: Date, required: true, description: "발생 시간" },
        type: { type: String, required: true, description: "알림 유형" },
        detail: { type: String, description: "상세 내용" },
        // (★수정★) String -> Number
        related_user_id: { type: Number, nullable: true, description: "관련 사용자 ID" },
        related_pm_id: { type: String, nullable: true, description: "관련 기기 번호" },
    };

    /**
     * EventLog 컬럼 매핑 (DB가 snake_case라고 가정)
     */
    static columns = [
        "log_id",
        "timestamp",
        "type",
        "detail",
        "related_user_id",
        "related_pm_id",
    ];
}

module.exports = EventLog;