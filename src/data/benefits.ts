export type BenefitCategory = '월세지원' | '전세지원' | '공공임대' | '매입임대' | '지자체지원'
export type BenefitRegion = '전국' | '서울' | '경기' | '인천' | '부산' | '기타'
export type IncomeLevel = '낮음' | '중간' | '확인 필요'
export type TargetGroup = '대학생' | '구직자' | '직장인' | '프리랜서'
export type BenefitStatus = '모집중' | '예정' | '마감'
export type Difficulty = '낮음' | '보통' | '높음'
export type SupportPreference = '월세 지원' | '전세 대출' | '공공임대' | '아직 모르겠음'

export type Benefit = {
  id: string
  title: string
  category: BenefitCategory
  region: BenefitRegion
  ageMin: number
  ageMax: number
  incomeLevel: IncomeLevel
  housingRequired: boolean
  targetGroups: TargetGroup[]
  status: BenefitStatus
  supportType: string
  supportAmount: string
  difficulty: Difficulty
  summary: string
  bestFor: string
  conditions: string[]
  documents: string[]
  pros: string[]
  cautions: string[]
  canCombineWith: string[]
  officialUrl: string
  updatedAt: string
  sourceName: string
}

export const benefits: Benefit[] = [
  {
    id: 'youth-monthly-rent',
    title: '청년 월세 지원',
    category: '월세지원',
    region: '전국',
    ageMin: 19,
    ageMax: 34,
    incomeLevel: '낮음',
    housingRequired: true,
    targetGroups: ['대학생', '구직자', '직장인', '프리랜서'],
    status: '모집중',
    supportType: '월세 현금 지원',
    supportAmount: '월 최대 20만원 수준',
    difficulty: '낮음',
    summary: '당장 월세 부담을 줄이고 싶은 사람에게 적합해요.',
    bestFor: '월세로 거주 중이고 매달 고정 주거비가 부담되는 청년',
    conditions: ['만 19~34세', '무주택 청년', '소득 및 임차 조건 확인 필요'],
    documents: ['임대차계약서', '월세 이체 증빙', '가족관계증명서', '통장 사본'],
    pros: ['거주지를 옮기지 않아도 신청 가능', '현금 흐름 개선 효과가 빠름'],
    cautions: ['부모 소득 또는 원가구 기준이 적용될 수 있음', '보증금과 월세 한도를 확인해야 함'],
    canCombineWith: ['버팀목 전세자금대출', '지자체 청년 주거 지원'],
    officialUrl: 'https://www.bokjiro.go.kr',
    updatedAt: '2026.06.14',
    sourceName: '복지로',
  },
  {
    id: 'youth-jeonse-rental',
    title: '청년 전세임대',
    category: '전세지원',
    region: '전국',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '낮음',
    housingRequired: true,
    targetGroups: ['대학생', '구직자', '직장인'],
    status: '예정',
    supportType: '전세보증금 지원',
    supportAmount: '지역과 유형별 한도 적용',
    difficulty: '보통',
    summary: '원하는 동네에서 전셋집을 직접 찾고 싶은 청년에게 맞아요.',
    bestFor: '공공임대 단지보다 생활권 선택을 더 중요하게 보는 청년',
    conditions: ['무주택 청년', '순위별 소득 및 자산 기준', '권리관계 확인 가능한 주택'],
    documents: ['주민등록등본', '소득 증빙', '자산 관련 서류', '임대차 예정 서류'],
    pros: ['거주 지역 선택 폭이 넓음', '전세 보증금 부담을 줄일 수 있음'],
    cautions: ['직접 매물을 찾아야 함', '권리 분석과 집주인 동의가 필요할 수 있음'],
    canCombineWith: ['청년 월세 지원'],
    officialUrl: 'https://apply.lh.or.kr',
    updatedAt: '2026.06.14',
    sourceName: 'LH',
  },
  {
    id: 'youth-butimok-loan',
    title: '버팀목 전세자금대출',
    category: '전세지원',
    region: '전국',
    ageMin: 19,
    ageMax: 34,
    incomeLevel: '중간',
    housingRequired: true,
    targetGroups: ['직장인', '프리랜서', '구직자'],
    status: '모집중',
    supportType: '저금리 전세 대출',
    supportAmount: '전세보증금 일부 대출',
    difficulty: '보통',
    summary: '전세로 이사할 계획이 있다면 확인해볼 만해요.',
    bestFor: '전세 계약을 앞두고 보증금 마련이 필요한 청년',
    conditions: ['만 19~34세', '무주택 세대주 또는 예정자', '소득 및 보증금 한도 확인'],
    documents: ['확정일자 임대차계약서', '소득 증빙', '재직 또는 사업 증빙', '주민등록등본'],
    pros: ['일반 대출보다 금리 부담이 낮을 수 있음', '상시 확인 가능한 대표 전세 지원'],
    cautions: ['대출이므로 상환 계획 필요', '은행 심사와 보증 심사가 진행될 수 있음'],
    canCombineWith: ['청년 월세 지원', '지자체 청년 주거 지원'],
    officialUrl: 'https://nhuf.molit.go.kr',
    updatedAt: '2026.06.14',
    sourceName: '주택도시기금',
  },
  {
    id: 'lh-happy-housing',
    title: 'LH 행복주택',
    category: '공공임대',
    region: '전국',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['대학생', '구직자', '직장인'],
    status: '예정',
    supportType: '공공임대주택',
    supportAmount: '시세 대비 낮은 임대료',
    difficulty: '높음',
    summary: '저렴하지만 경쟁률과 모집 시기를 확인해야 해요.',
    bestFor: '임대료를 낮추고 안정적으로 오래 거주하고 싶은 청년',
    conditions: ['무주택 요건', '계층별 소득 및 자산 기준', '공고별 지역 또는 순위 조건'],
    documents: ['주민등록등본', '가족관계증명서', '소득 및 자산 증빙', '청약 관련 서류'],
    pros: ['임대료가 비교적 낮음', '주거 안정성이 높음'],
    cautions: ['공고 시기가 지역별로 다름', '경쟁률이 높을 수 있음'],
    canCombineWith: [],
    officialUrl: 'https://apply.lh.or.kr',
    updatedAt: '2026.06.14',
    sourceName: 'LH',
  },
  {
    id: 'youth-purchase-rental',
    title: '청년 매입임대',
    category: '매입임대',
    region: '전국',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '낮음',
    housingRequired: true,
    targetGroups: ['대학생', '구직자', '직장인'],
    status: '마감',
    supportType: '매입임대주택',
    supportAmount: '시세보다 낮은 보증금과 임대료',
    difficulty: '높음',
    summary: '기존 주택을 저렴하게 임대받고 싶은 청년에게 좋아요.',
    bestFor: '원룸이나 다가구 형태의 저렴한 임대주택을 찾는 청년',
    conditions: ['무주택 청년', '소득 및 자산 기준', '순위별 입주자 선정'],
    documents: ['신청서', '주민등록등본', '소득 증빙', '자산 확인 서류'],
    pros: ['임대료가 낮은 편', '이미 지어진 주택에 입주하는 경우가 많음'],
    cautions: ['모집 물량이 제한적', '지역별 주택 상태와 위치 차이가 큼'],
    canCombineWith: [],
    officialUrl: 'https://apply.lh.or.kr',
    updatedAt: '2026.06.14',
    sourceName: 'LH',
  },
  {
    id: 'local-youth-housing',
    title: '지자체 청년 주거 지원',
    category: '지자체지원',
    region: '서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['대학생', '구직자', '직장인', '프리랜서'],
    status: '모집중',
    supportType: '지역별 월세·보증금·이사비 지원',
    supportAmount: '지자체 공고별 상이',
    difficulty: '보통',
    summary: '사는 지역의 별도 혜택을 놓치지 않으려면 꼭 확인해야 해요.',
    bestFor: '특정 지역에 거주하거나 전입 예정인 청년',
    conditions: ['지역 거주 또는 전입 요건', '연령 요건', '소득과 주택 조건은 공고별 확인'],
    documents: ['주민등록등본', '임대차계약서', '소득 증빙', '지역별 추가 서류'],
    pros: ['전국 사업과 별개로 추가 혜택 가능', '월세, 보증금, 이사비 등 유형이 다양함'],
    cautions: ['지역마다 신청 기간과 조건이 다름', '중복 수급 제한을 확인해야 함'],
    canCombineWith: ['청년 월세 지원', '버팀목 전세자금대출'],
    officialUrl: 'https://www.youthcenter.go.kr',
    updatedAt: '2026.06.14',
    sourceName: '지자체 공식 홈페이지',
  },
]
