import type { BenefitRegion, BenefitStatus, Difficulty, IncomeLevel, TargetGroup } from './benefits'

export type HousingType = '행복주택' | '청년매입임대' | '공공임대' | '역세권 청년주택' | '지자체 청년주택'
export type EnvironmentTag =
  | '역세권'
  | '대학교 통학권'
  | '직장/도심 접근성'
  | '도서관 근처'
  | '공원/산책로 근처'
  | '병원·약국 근처'
  | '마트·편의점 근처'
  | '공공시설 근처'
  | '안전 인프라 확인'

export type HousingEnvironment = {
  transit: {
    nearestStation: string
    walkingMinutesToStation: number
    busStopCountNearby: number | '확인 필요'
  }
  education: {
    nearbyUniversities: string[]
    commuteNotes: string
  }
  publicFacilities: {
    libraries: string[]
    communityCenters: string[]
  }
  dailyLife: {
    parks: string[]
    hospitals: string[]
    pharmacies: string[]
    marts: string[]
  }
  safetyInfra: {
    safeReturnRoad: string
    cctvOrEmergencyBell: string
    policeOffice: string
    note: string
  }
}

export type HousingOption = {
  id: string
  name: string
  type: HousingType
  address: string
  region: BenefitRegion
  sido: BenefitRegion
  sigungu: string
  dong: string
  nearbyStation: string
  nearbyLandmarks: string[]
  lat: number
  lng: number
  nearestStation: string
  walkingMinutesToStation: number
  deposit: number
  monthlyRent: number
  status: BenefitStatus
  targetGroups: TargetGroup[]
  ageMin: number
  ageMax: number
  incomeLevel: IncomeLevel
  requiresNoHome: boolean
  difficulty: Difficulty
  summary: string
  bestFor: string
  cautions: string[]
  officialUrl: string
  sourceName: string
  updatedAt: string
  supportTypes: HousingType[]
  monthlyRentNumber: number
  depositNumber: number
  environmentTags: EnvironmentTag[]
  environment: HousingEnvironment
}

export const housingOptions: HousingOption[] = [
  {
    id: 'seongbuk-youth-purchase',
    name: '성북구 청년매입임대',
    type: '청년매입임대',
    address: '서울 성북구 동소문로 00',
    region: '서울',
    sido: '서울',
    sigungu: '성북구',
    dong: '동소문동',
    nearbyStation: '성신여대입구역',
    nearbyLandmarks: ['성신여대입구역', '성신여자대학교', '한성대학교'],
    lat: 37.5926,
    lng: 127.0165,
    nearestStation: '성신여대입구역',
    walkingMinutesToStation: 7,
    deposit: 1200,
    monthlyRent: 18,
    status: '모집중',
    targetGroups: ['대학생', '구직자', '직장인'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '낮음',
    requiresNoHome: true,
    difficulty: '높음',
    summary: '대학가와 지하철 접근성이 좋아 월세 부담을 낮추고 싶은 청년에게 적합합니다.',
    bestFor: '성북·종로·동대문 생활권의 대학생 또는 사회초년생',
    cautions: ['모집 물량이 적을 수 있음', '주택별 컨디션 차이를 확인해야 함'],
    officialUrl: 'https://apply.lh.or.kr',
    sourceName: 'LH',
    updatedAt: '2026.06.14',
    supportTypes: ['청년매입임대'],
    monthlyRentNumber: 18,
    depositNumber: 1200,
    environmentTags: ['역세권', '대학교 통학권', '직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '성신여대입구역', walkingMinutesToStation: 7, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['성신여자대학교', '한성대학교'], commuteNotes: '성북·대학로 통학권 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['동 주민센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '안심귀갓길 데이터 확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '치안 단정이 아니라 안전 인프라 접근성 기준',
      },
    },
  },
  {
    id: 'mapo-station-youth',
    name: '마포 역세권 청년주택',
    type: '역세권 청년주택',
    address: '서울 마포구 백범로 00',
    region: '서울',
    sido: '서울',
    sigungu: '마포구',
    dong: '공덕동',
    nearbyStation: '공덕역',
    nearbyLandmarks: ['공덕역', '마포역', '서강대학교', '숙명여자대학교'],
    lat: 37.5558,
    lng: 126.9368,
    nearestStation: '공덕역',
    walkingMinutesToStation: 4,
    deposit: 2500,
    monthlyRent: 36,
    status: '예정',
    targetGroups: ['직장인', '프리랜서', '구직자'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    requiresNoHome: true,
    difficulty: '높음',
    summary: '출퇴근 동선이 중요한 청년에게 유리한 역세권 주거 옵션입니다.',
    bestFor: '마포·여의도·용산권으로 출퇴근하는 청년',
    cautions: ['유형별 임대료 차이가 큼', '경쟁률과 공고 시기를 확인해야 함'],
    officialUrl: 'https://www.i-sh.co.kr',
    sourceName: '서울주택도시공사',
    updatedAt: '2026.06.14',
    supportTypes: ['역세권 청년주택'],
    monthlyRentNumber: 36,
    depositNumber: 2500,
    environmentTags: ['역세권', '대학교 통학권', '직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '공덕역', walkingMinutesToStation: 4, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['서강대학교', '숙명여자대학교'], commuteNotes: '마포·신촌·용산 통학권 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['동 주민센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '안심귀갓길 데이터 확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '야간 귀가 시설 확인 필요',
      },
    },
  },
  {
    id: 'gyeonggi-happy-housing',
    name: '판교 청년 행복주택',
    type: '행복주택',
    address: '경기 성남시 분당구 판교로 00',
    region: '경기',
    sido: '경기',
    sigungu: '성남시 분당구',
    dong: '판교동',
    nearbyStation: '판교역',
    nearbyLandmarks: ['판교역', '판교테크노밸리'],
    lat: 37.3948,
    lng: 127.1112,
    nearestStation: '판교역',
    walkingMinutesToStation: 12,
    deposit: 1800,
    monthlyRent: 24,
    status: '모집중',
    targetGroups: ['직장인', '구직자'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    requiresNoHome: true,
    difficulty: '높음',
    summary: 'IT 업무지구와 가까운 공공임대형 주거지원입니다.',
    bestFor: '성남·판교 근처 직장인 또는 취업 준비 청년',
    cautions: ['공고별 공급 유형을 확인해야 함', '입주까지 시간이 걸릴 수 있음'],
    officialUrl: 'https://apply.lh.or.kr',
    sourceName: 'LH',
    updatedAt: '2026.06.14',
    supportTypes: ['행복주택'],
    monthlyRentNumber: 24,
    depositNumber: 1800,
    environmentTags: ['직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '판교역', walkingMinutesToStation: 12, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['가까운 대학교 확인 필요'], commuteNotes: '판교·성남 업무지구 접근성 중심 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['행정복지센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '안전 인프라 접근성 기준으로 확인 필요',
      },
    },
  },
  {
    id: 'incheon-public-rental',
    name: '부평 청년 공공임대',
    type: '공공임대',
    address: '인천 부평구 부평대로 00',
    region: '인천',
    sido: '인천',
    sigungu: '부평구',
    dong: '부평동',
    nearbyStation: '부평역',
    nearbyLandmarks: ['부평역', '부평대로'],
    lat: 37.4895,
    lng: 126.7249,
    nearestStation: '부평역',
    walkingMinutesToStation: 9,
    deposit: 900,
    monthlyRent: 16,
    status: '모집중',
    targetGroups: ['대학생', '구직자', '직장인', '프리랜서'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '낮음',
    requiresNoHome: true,
    difficulty: '보통',
    summary: '인천 1호선과 경인선 접근성이 좋은 공공임대 옵션입니다.',
    bestFor: '인천 또는 서울 서부권 생활권의 청년',
    cautions: ['지역 우선 조건을 확인해야 함'],
    officialUrl: 'https://www.ih.co.kr',
    sourceName: '인천도시공사',
    updatedAt: '2026.06.14',
    supportTypes: ['공공임대'],
    monthlyRentNumber: 16,
    depositNumber: 900,
    environmentTags: ['역세권', '직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '부평역', walkingMinutesToStation: 9, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['가까운 대학교 확인 필요'], commuteNotes: '인천·서울 서부권 통학/출퇴근 동선 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['동 행정복지센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '야간 귀가 시설 확인 필요',
      },
    },
  },
  {
    id: 'busan-youth-local',
    name: '부산 청년안심주택',
    type: '지자체 청년주택',
    address: '부산 부산진구 중앙대로 00',
    region: '부산',
    sido: '부산',
    sigungu: '부산진구',
    dong: '부전동',
    nearbyStation: '서면역',
    nearbyLandmarks: ['서면역', '중앙대로'],
    lat: 35.1577,
    lng: 129.0591,
    nearestStation: '서면역',
    walkingMinutesToStation: 5,
    deposit: 1500,
    monthlyRent: 22,
    status: '예정',
    targetGroups: ['대학생', '직장인', '프리랜서'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '중간',
    requiresNoHome: true,
    difficulty: '보통',
    summary: '부산 중심 상권과 가까운 지자체 청년주택 샘플입니다.',
    bestFor: '부산 도심 생활권을 원하는 청년',
    cautions: ['부산시 공고 일정 확인 필요', '중복 지원 제한을 확인해야 함'],
    officialUrl: 'https://www.busan.go.kr',
    sourceName: '부산광역시',
    updatedAt: '2026.06.14',
    supportTypes: ['지자체 청년주택'],
    monthlyRentNumber: 22,
    depositNumber: 1500,
    environmentTags: ['역세권', '직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '서면역', walkingMinutesToStation: 5, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['가까운 대학교 확인 필요'], commuteNotes: '부산 도심 생활권 기준 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['동 주민센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '안전 인프라 접근성 기준으로 확인 필요',
      },
    },
  },
  {
    id: 'gwanak-youth-purchase',
    name: '관악구 청년매입임대',
    type: '청년매입임대',
    address: '서울 관악구 남부순환로 00',
    region: '서울',
    sido: '서울',
    sigungu: '관악구',
    dong: '봉천동',
    nearbyStation: '서울대입구역',
    nearbyLandmarks: ['서울대입구역', '서울대학교'],
    lat: 37.4812,
    lng: 126.9527,
    nearestStation: '서울대입구역',
    walkingMinutesToStation: 8,
    deposit: 1000,
    monthlyRent: 17,
    status: '마감',
    targetGroups: ['대학생', '구직자'],
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '낮음',
    requiresNoHome: true,
    difficulty: '높음',
    summary: '학교와 고시촌 생활권을 함께 고려하는 청년에게 맞는 옵션입니다.',
    bestFor: '관악구 대학생, 취업 준비생, 1인 가구 청년',
    cautions: ['마감 공고이므로 다음 모집 알림이 필요함'],
    officialUrl: 'https://apply.lh.or.kr',
    sourceName: 'LH',
    updatedAt: '2026.06.14',
    supportTypes: ['청년매입임대'],
    monthlyRentNumber: 17,
    depositNumber: 1000,
    environmentTags: ['역세권', '대학교 통학권', '직장/도심 접근성'],
    environment: {
      transit: { nearestStation: '서울대입구역', walkingMinutesToStation: 8, busStopCountNearby: '확인 필요' },
      education: { nearbyUniversities: ['서울대학교'], commuteNotes: '관악구 대학생·취업준비생 생활권 확인 필요' },
      publicFacilities: { libraries: ['가까운 도서관 확인 필요'], communityCenters: ['동 주민센터 확인 필요'] },
      dailyLife: {
        parks: ['근처 공원 확인 필요'],
        hospitals: ['근처 병원 확인 필요'],
        pharmacies: ['반경 500m 내 약국 확인 필요'],
        marts: ['반경 500m 내 편의점/마트 확인 필요'],
      },
      safetyInfra: {
        safeReturnRoad: '안심귀갓길 데이터 확인 필요',
        cctvOrEmergencyBell: '공공데이터 확인 필요',
        policeOffice: '가까운 지구대/파출소 확인 필요',
        note: '치안 단정이 아니라 안전 인프라 접근성 기준',
      },
    },
  },
]
