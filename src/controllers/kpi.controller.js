// PM_back/src/controllers/kpi.controller.js

const kpiService = require("../services/kpi.service");
const apiResponse = require("../utils/apiResponse");

/**
 * KPI 생성
 * POST /api/admin/kpis
 */
const create = async (req, res, next) => {
    try {
        // 프론트엔드에서 보내는 데이터: { kpi_name, kpi_desc, weight }
        const { kpi_name, kpi_desc, weight } = req.body;

        // 유효성 검사
        if (!kpi_name || weight === undefined) {
            return res.status(400).json(apiResponse.error("KPI 이름과 가중치는 필수입니다.", 400));
        }

        // 서비스 호출
        const newKpi = await kpiService.createKPI({ kpi_name, kpi_desc, weight });

        return res.status(201).json(apiResponse.success(newKpi, "KPI 생성 성공"));
    } catch (error) {
        next(error);
    }
};

/**
 * KPI 목록 조회
 * GET /api/admin/kpis
 */
const findAll = async (req, res, next) => {
    try {
        const kpis = await kpiService.getAllKPIs();
        return res.status(200).json(apiResponse.success(kpis, "KPI 목록 조회 성공"));
    } catch (error) {
        next(error);
    }
};

/**
 * KPI 단일 조회 (필요 시 구현, 현재는 미사용)
 * GET /api/admin/kpis/:id
 */
const findById = async (req, res, next) => {
    try {
        // 현재 명세서 상 목록 조회가 주력이므로 구현 보류 (필요하면 서비스 연결)
        return res.status(501).json(apiResponse.error("Not Implemented"));
    } catch (error) {
        next(error);
    }
};

/**
 * KPI 수정
 * PUT /api/admin/kpis/:id
 */
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedKpi = await kpiService.updateKPI(id, updateData);

        if (!updatedKpi) {
            return res.status(404).json(apiResponse.error("해당 KPI를 찾을 수 없습니다.", 404));
        }

        return res.status(200).json(apiResponse.success(updatedKpi, "KPI 수정 성공"));
    } catch (error) {
        next(error);
    }
};

/**
 * KPI 삭제
 * DELETE /api/admin/kpis/:id
 */
const deleteKpi = async (req, res, next) => {
    try {
        const { id } = req.params;

        await kpiService.deleteKPI(id);

        return res.status(200).json(apiResponse.success(null, "KPI 삭제 성공"));
    } catch (error) {
        next(error);
    }
};

// 라우터에서 사용하는 이름으로 매핑하여 내보내기
module.exports = {
    create,
    findAll,
    findById,
    update,
    delete: deleteKpi, // 'delete'는 예약어라 변수명 대신 속성명으로 사용
};