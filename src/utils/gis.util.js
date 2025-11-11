// GIS 유틸리티: 거리 계산, 좌표 변환
const R = 6371; // 지구 반지름 (km)

/**
 * 두 좌표 간의 거리 계산 (Haversine 공식)
 * @param {object} start { lat, lng }
 * @param {object} end { lat, lng }
 * @returns {number} 거리 (km)
 */
const calculateDistance = (start, end) => {
  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.latitude || end.lat);
  const lon1 = toRad(start.lng);
  const lon2 = toRad(end.longitude || end.lng);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 소수점 둘째 자리
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
  calculateDistance,
  toRad,
  wgs84ToTM,
};
