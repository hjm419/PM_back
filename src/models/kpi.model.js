// PM_back/src/models/kpi.model.js

// KPI 모델 (T_RISK_KPI 데이터 스키마)

/**
 * T_RISK_KPI 테이블 스키마 정의 (Repository 기준 수정)
 *
 * CREATE TABLE t_risk_kpi (
 * kpi_id VARCHAR(50) PRIMARY KEY, -- 예: 'kpi_helmet_off'
 * kpi_name VARCHAR(255) NOT NULL, -- 예: '헬멧 미착용'
 * kpi_desc TEXT,                 -- 예: '헬멧 미착용 감지'
 * weight INT NOT NULL DEFAULT 0  -- 예: 10 (감점 점수)
 * );
 */

class KPI {
    /**
     * KPI 스키마 필드 정의
     */
    static schema = {
        kpi_id: {
            type: String,
            primaryKey: true,
            description: "KPI ID (예: kpi_helmet_off)",
        },
        kpi_name: {
            type: String,
            required: true,
            description: "KPI 이름 (예: 헬멧 미착용)",
        },
        kpi_desc: { type: String, description: "KPI 설명" },
        weight: {
            type: Number,
            default: 0,
            description: "위험 가중치 (감점 점수)",
        },
    };

    /**
     * KPI 컬럼 매핑
     */
    static columns = ["kpi_id", "kpi_name", "kpi_desc", "weight"];
}

module.exports = KPI;