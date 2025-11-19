// PM_back/src/services/kpi.service.js

const KPIRepository = require("../repository/kpi.repository");

class KPIService {
  /**
   * KPI 항목 생성
   * @param {object} param0 { kpi_name, kpi_desc, weight }
   * @returns {Promise<object>} 생성된 KPI 객체
   */
  async createKPI({ kpi_name, kpi_desc, weight }) {
    // Repository create 메소드는 { kpi_name, kpi_desc, weight } 객체를 기대함
    const newKPI = await KPIRepository.create({ kpi_name, kpi_desc, weight });
    return newKPI;
  }

  /**
   * 모든 KPI 항목 조회
   * @returns {Promise<array>} KPI 항목 배열
   */
  async getAllKPIs() {
    const kpis = await KPIRepository.findAll();
    return kpis;
  }

  /**
   * KPI 항목 수정
   * @param {string} kpiId
   * @param {object} updateData { name, weight } 등
   * @returns {Promise<object>} 수정된 KPI 객체
   */
  async updateKPI(kpiId, updateData) {
    const updatedKPI = await KPIRepository.update(kpiId, updateData);
    return updatedKPI;
  }

  /**
   * KPI 항목 삭제
   * @param {string} kpiId
   * @returns {Promise<void>}
   */
  async deleteKPI(kpiId) {
    await KPIRepository.delete(kpiId);
  }

  /**
   * 주행 데이터를 분석하여 KPI 가중치 추천
   */
  async recommendWeights() {
    // 1. 전체 사고 주행 수와 정상 주행 수 조회
    const totalAccidents = await RideRepository.countByAccident(true);
    const totalNormals = await RideRepository.countByAccident(false);

    // 데이터가 너무 적으면 분석 불가 (예: 최소 사고 데이터 5건 필요)
    const isNotEnoughData = totalAccidents < 5 || totalNormals < 10;

    // 2. KPI별 발생 통계 조회
    const kpiStats = await KPIRepository.getKpiStats();

    // 3. 분석 및 추천 점수 계산
    const recommendations = kpiStats.map((stat) => {
      const currentWeight = parseFloat(stat.current_weight);

      if (isNotEnoughData) {
        return {
          kpi_id: stat.kpi_id,
          name: stat.kpi_name,
          current_weight: currentWeight,
          recommended_weight: currentWeight, // 데이터 부족 시 현상 유지
          reason: "데이터 부족 (분석 보류)",
          risk_ratio: 0,
        };
      }

      // 평균 발생 빈도 (주행 1회당 발생 횟수)
      // 0으로 나누기 방지 (Math.max(..., 1))
      const freqInAccident =
        parseInt(stat.accident_count) / Math.max(totalAccidents, 1);
      const freqInNormal =
        parseInt(stat.normal_count) / Math.max(totalNormals, 1);

      // 위험도 계수 (Risk Ratio) 계산
      // 예: 사고 시 0.5번 발생, 정상 시 0.1번 발생 -> Ratio 5.0 (5배 더 위험함)
      let riskRatio = 0;
      if (freqInNormal > 0) {
        riskRatio = freqInAccident / freqInNormal;
      } else if (freqInAccident > 0) {
        riskRatio = 5.0; // 정상 주행에선 안 나타나는데 사고 때만 나타나면 매우 위험 (최대치 부여)
      } else {
        riskRatio = 1.0; // 둘 다 안 나타나면 중립
      }

      // [가중치 추천 공식]
      // 기본 공식: 현재 가중치 * (위험도 계수 ^ 0.5)
      // (제곱근을 씌우는 이유는 Ratio가 10배라고 점수를 10배 올리면 너무 극단적이기 때문에 완화함)
      let suggested = currentWeight * Math.sqrt(riskRatio);

      // 보정: 너무 급격한 변화 방지 및 범위 제한 (0.5점 ~ 10점)
      suggested = Math.min(10.0, Math.max(0.5, suggested));

      // 소수점 2자리 반올림
      suggested = Math.round(suggested * 100) / 100;

      // 등락폭 코멘트
      let reason = "-";
      if (suggested > currentWeight * 1.1)
        reason = `사고 시 발생 빈도 높음 (${riskRatio.toFixed(1)}배)`;
      else if (suggested < currentWeight * 0.9) reason = `사고 연관성 낮음`;
      else reason = "적정 수준 유지";

      return {
        kpi_id: stat.kpi_id,
        name: stat.kpi_name,
        current_weight: currentWeight,
        recommended_weight: suggested,
        risk_ratio: riskRatio.toFixed(2),
        reason: reason,
      };
    });

    return {
      total_rides: totalAccidents + totalNormals,
      accident_rides: totalAccidents,
      analysis_result: recommendations,
    };
  }
}

module.exports = new KPIService();
