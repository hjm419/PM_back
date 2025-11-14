// PM_back/src/utils/gis.util.js

// GIS 유틸리티: 좌표 변환
const R = 6371; // 지구 반지름 (km)

/**
 * (★신규★) PostGIS (ST_AsGeoJSON)가 반환한 JSON 문자열을
 * 프론트엔드가 사용하는 { lat, lng } 객체로 변환합니다.
 * @param {string | null} geoJSONString '{"type":"Point","coordinates":[lng,lat]}'
 * @returns {object | null} { lat, lng }
 */
const parseGeoJSON = (geoJSONString) => {
    if (!geoJSONString || typeof geoJSONString !== "string") {
        return null;
    }
    try {
        const geo = JSON.parse(geoJSONString);
        if (geo && geo.type === "Point" && geo.coordinates) {
            // GeoJSON은 [lng, lat] 순서입니다.
            return {
                lat: geo.coordinates[1],
                lng: geo.coordinates[0],
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to parse GeoJSON:", e);
        return null;
    }
};

/**
 * (★사용되지 않음★)
 * 두 좌표 간의 거리 계산 (Haversine 공식)
 * (이 로직은 DB의 ST_Distance 함수로 대체되었습니다)
 */
const calculateDistance = (start, end) => {
    // ... (기존 코드와 동일)
};

/**
 * 각도를 라디안으로 변환
 * @param {number} deg 각도
 * @returns {number} 라디안
 */
const toRad = (deg) => {
    return (deg * Math.PI) / 180;
};

/**
 * WGS84 좌표를 TM 좌표로 변환 (한국 통일 좌표계)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {object} { x, y }
 */
const wgs84ToTM = (latitude, longitude) => {
    // TODO: 실제 변환 로직 구현
    // 웹 지도 API 문서 참고
    return { x: 0, y: 0 };
};

module.exports = {
    calculateDistance, // (사용되지 않음)
    toRad,
    wgs84ToTM,
    parseGeoJSON, // (★신규 추가★)
};