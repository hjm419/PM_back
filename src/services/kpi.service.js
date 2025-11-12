const KPI = require("../models/kpi.model");

class KPIService {
  /**
   * KPI 항목 생성
   * @param {object} param0 { name, weight }
   * @returns {Promise<object>} 생성된 KPI 객체
   */
  async createKPI({ name, weight }) {
    const newKPI = await KPI.create({ name, weight });
    return newKPI;
  }
  /**
   * 모든 KPI 항목 조회
   * @returns {Promise<array>} KPI 항목 배열
   */
  async getAllKPIs() {
    const kpis = await KPI.findAll();
    return kpis;
  }
  /**
   * KPI 항목 수정
   * @param {string} kpiId
   * @param {object} updateData { name, weight }
   * @returns {Promise<object>} 수정된 KPI 객체
   */
  async updateKPI(kpiId, updateData) {
    const updatedKPI = await KPI.update(kpiId, updateData);
    return updatedKPI;
  }
  /**
   * KPI 항목 삭제
   * @param {string} kpiId
   * @returns {Promise<void>}
   */
  async deleteKPI(kpiId) {
    await KPI.delete(kpiId);
  }
}

module.exports = new KPIService();
