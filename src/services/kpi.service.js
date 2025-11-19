// PM_back/src/services/kpi.service.js

const KPIRepository = require("../repository/kpi.repository");
const RideRepository = require("../repository/ride.repository"); // (★추가됨★)

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
   * 주행 데이터를 분석하여 KPI 가중치 추천 (상대적 위험도 방식)
   */
  async recommendWeights() {
    // 1. 전체 사고 주행 수와 정상 주행 수 조회
    const totalAccidents = await RideRepository.countByAccident(true);
    const totalNormals = await RideRepository.countByAccident(false);

    const isNotEnoughData = totalAccidents < 5 || totalNormals < 10;

    // 2. KPI별 통계 조회
    const kpiStats = await KPIRepository.getKpiStats();

    // [설정] 기준이 될 KPI ID (예: 4번 급감속, 혹은 2번 급정지)
    // 가장 데이터가 많고 일반적인 위험 항목을 기준으로 잡는 것이 좋습니다.
    const BASELINE_KPI_ID = 4;

    // 3. 각 KPI별 '원시 위험비(Raw Risk Ratio)' 먼저 계산
    const rawRatios = {};
    let baselineRatio = 1.0; // 기준점의 위험비 (기본값 1.0)
    let baselineWeight = 1.8; // 기준점의 '표준' 가중치 (DB값 또는 고정값)

    kpiStats.forEach((stat) => {
      const freqInAccident =
        parseInt(stat.accident_count) / Math.max(totalAccidents, 1);
      const freqInNormal =
        parseInt(stat.normal_count) / Math.max(totalNormals, 1);

      let ratio = 0;
      if (freqInNormal > 0) {
        ratio = freqInAccident / freqInNormal;
      } else if (freqInAccident > 0) {
        ratio = 5.0; // 최대 위험
      } else {
        ratio = 1.0; // 중립
      }

      rawRatios[stat.kpi_id] = ratio;

      // 기준 KPI 정보를 저장해둠
      if (stat.kpi_id == BASELINE_KPI_ID) {
        baselineRatio = ratio;
        // 기준 KPI의 현재 가중치를 기준으로 삼거나, 정책적으로 고정된 값(예: 1.8)을 쓸 수도 있음
        // 여기서는 DB에 저장된 현재 가중치를 기준으로 삼음
        baselineWeight = parseFloat(stat.current_weight) || 1.8;
      }
    });

    // 기준점이 데이터가 없어 0이 되는 것 방지
    if (baselineRatio === 0) baselineRatio = 1.0;

    // 4. 기준점 대비 상대 가중치 계산
    const recommendations = kpiStats.map((stat) => {
      const currentWeight = parseFloat(stat.current_weight);

      if (isNotEnoughData) {
        return {
          kpi_id: stat.kpi_id,
          name: stat.kpi_name,
          current_weight: currentWeight,
          recommended_weight: currentWeight,
          reason: "데이터 부족",
          risk_ratio: 0,
        };
      }

      // [핵심 로직] 상대적 위험도(Relative Risk) 계산
      // 내 위험비 / 기준 위험비
      const myRawRatio = rawRatios[stat.kpi_id];
      const relativeFactor = myRawRatio / baselineRatio;

      // 추천 가중치 = 기준 가중치 * 상대적 배수
      let suggested = baselineWeight * relativeFactor;

      // 예외 처리: 너무 극단적인 값 보정 (0.5 ~ 10.0)
      suggested = Math.min(10.0, Math.max(0.5, suggested));

      // 소수점 2자리
      suggested = Math.round(suggested * 100) / 100;

      // 코멘트 생성
      let reason = "적정 수준";
      if (stat.kpi_id == BASELINE_KPI_ID) {
        reason = "기준 지표 (Baseline)";
      } else {
        if (relativeFactor > 1.2)
          reason = `기준보다 ${relativeFactor.toFixed(1)}배 더 위험`;
        else if (relativeFactor < 0.8)
          reason = `기준보다 덜 위험 (${relativeFactor.toFixed(1)}배)`;
      }

      return {
        kpi_id: stat.kpi_id,
        name: stat.kpi_name,
        current_weight: currentWeight,
        recommended_weight: suggested,
        risk_ratio: relativeFactor.toFixed(2), // 여기서는 '상대적 비율'을 보여줌
        reason: reason,
      };
    });

    return {
      total_rides: totalAccidents + totalNormals,
      accident_rides: totalAccidents,
      baseline_kpi_id: BASELINE_KPI_ID,
      analysis_result: recommendations,
    };
  }
}

module.exports = new KPIService();
