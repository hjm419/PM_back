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
}

module.exports = new KPIService();