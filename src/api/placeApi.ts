import type { HousingEnvironment, HousingOption } from '../data/housingOptions'

type PlaceApiInput = Pick<HousingOption, 'lat' | 'lng' | 'name' | 'nearestStation' | 'walkingMinutesToStation' | 'environment'>

export async function searchNearbyPlaces(option: PlaceApiInput): Promise<HousingEnvironment['dailyLife']> {
  // TODO: Kakao Local API category search 연결 위치.
  // VITE_KAKAO_REST_API_KEY를 사용해 병원, 약국, 편의점, 마트, 공원 등을 좌표 기준으로 조회합니다.
  return option.environment.dailyLife
}

export async function searchNearbyTransit(option: PlaceApiInput): Promise<HousingEnvironment['transit']> {
  // TODO: Kakao Local API 또는 교통 공공데이터 연결 위치.
  // 현재는 샘플 데이터의 역/도보 시간/버스 접근성 정보를 반환합니다.
  return option.environment.transit
}

export async function searchNearbyUniversities(option: PlaceApiInput): Promise<HousingEnvironment['education']> {
  // TODO: Kakao Local API keyword search로 대학교, 학교, 주요 통학권을 조회합니다.
  return option.environment.education
}

export async function searchNearbyPublicFacilities(option: PlaceApiInput): Promise<HousingEnvironment['publicFacilities']> {
  // TODO: Kakao Local API 및 공공데이터포털로 도서관, 주민센터, 공공시설을 조회합니다.
  return option.environment.publicFacilities
}

export async function searchNearbySafetyInfra(option: PlaceApiInput): Promise<HousingEnvironment['safetyInfra']> {
  // TODO: 공공데이터포털/서울 열린데이터광장 안심귀갓길, CCTV, 비상벨, 안심귀가 스카우트 데이터 연결 위치.
  // 치안 좋음/나쁨을 단정하지 않고 안전 인프라 접근성만 표시합니다.
  return option.environment.safetyInfra
}
