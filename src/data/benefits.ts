export type BenefitCategory =
  | '주거비 지원'
  | '전월세 보증금 지원'
  | '공공임대/매입임대'
  | '공공/민간 청년 임대주택'
  | '공공임대'
  | '첫 독립 가이드'
  | '주거 위기 지원'
export type BenefitRegion = '전국' | '전국/서울' | '서울' | '서울 성북구' | '경기' | '인천' | '부산' | '기타'
export type IncomeLevel = '낮음' | '중간' | '확인 필요'
export type TargetGroup =
  | '청년'
  | '무주택자'
  | '월세 거주자'
  | '근로청년'
  | '취업준비생'
  | '대학생'
  | '사회초년생'
  | '신혼부부'
  | '1인 가구'
  | '자립 준비 청년'
  | '성북구 인근 거주 청년'
  | '전세사기 피해자'
  | '구직자'
  | '직장인'
  | '프리랜서'
export type BenefitStatus = '모집중' | '예정' | '마감'
export type Difficulty = '낮음' | '보통' | '높음'
export type SupportPreference = '월세 지원' | '전세 대출' | '공공임대' | '아직 모르겠음'
export type DataStatus = '공식 확인' | '공고 확인 필요' | '샘플'

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
  dataStatus: DataStatus
  noticeStatus: string
}

const updatedAt = '2026.06.15'

export const benefits: Benefit[] = [
  {
    id: 'seoul-youth-monthly-rent',
    title: '서울 청년월세지원',
    category: '주거비 지원',
    region: '서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['청년', '무주택자', '월세 거주자'],
    status: '모집중',
    supportType: '월세 지원',
    supportAmount: '공식 공고 확인 필요',
    difficulty: '보통',
    summary: '서울 거주 청년의 주거비 부담을 줄이기 위한 월세 지원사업',
    bestFor: '서울에 거주하며 월세 부담을 먼저 줄이고 싶은 무주택 청년',
    conditions: [
      '서울시 거주',
      '만 19~39세 청년',
      '무주택자',
      '임차보증금 및 월세 기준 확인 필요',
      '소득 기준 확인 필요',
    ],
    documents: ['임대차계약서', '월세 이체 증빙', '가족관계증명서', '공식 공고별 제출서류 확인 필요'],
    pros: ['거주 중인 월세 주택을 기준으로 확인 가능', '주거비 부담 완화에 직접 연결됨'],
    cautions: ['신청 기간과 선정 기준은 공식 공고 확인 필요', '중복 수급 제한 여부 확인 필요'],
    canCombineWith: ['청년 임차보증금 이자지원', 'LH 청년매입임대'],
    officialUrl: 'https://housing.seoul.go.kr/site/main/content/sh01_060513',
    updatedAt,
    sourceName: '서울주거포털',
    dataStatus: '공식 확인',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'seoul-youth-deposit-interest',
    title: '청년 임차보증금 이자지원',
    category: '전월세 보증금 지원',
    region: '서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['청년', '근로청년', '취업준비생'],
    status: '모집중',
    supportType: '임차보증금 대출 및 이자지원',
    supportAmount: '최대 2억원, 임차보증금의 90% 이내',
    difficulty: '보통',
    summary: '목돈 마련이 어려운 청년에게 임차보증금 대출 및 이자를 지원하는 사업',
    bestFor: '서울에서 전월세 보증금 마련이 필요한 청년',
    conditions: [
      '만 19~39세 이하',
      '임차보증금 용도',
      '소득 기준 및 세부 조건 공식 확인 필요',
    ],
    documents: ['주민등록등본', '임대차계약 관련 서류', '소득 증빙', '공식 공고별 제출서류 확인 필요'],
    pros: ['보증금 목돈 부담을 낮출 수 있음', '서울주거포털에서 세부 조건 확인 가능'],
    cautions: ['대출 심사와 이자지원 조건 확인 필요', '계약 전 금융기관 심사 가능 여부 확인 필요'],
    canCombineWith: ['서울 청년월세지원', '청년안심주택'],
    officialUrl: 'https://housing.seoul.go.kr/site/main/content/sh01_040901',
    updatedAt,
    sourceName: '서울주거포털',
    dataStatus: '공식 확인',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'lh-youth-purchase-rental',
    title: 'LH 청년매입임대',
    category: '공공임대/매입임대',
    region: '서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['청년', '대학생', '취업준비생', '사회초년생'],
    status: '예정',
    supportType: '공공임대 주택공급',
    supportAmount: '공고별 상이',
    difficulty: '높음',
    summary: 'LH가 매입한 주택을 청년에게 임대하는 주거지원',
    bestFor: '서울 내 매입임대 주택 공고를 확인하며 저렴한 임대주택을 찾는 청년',
    conditions: [
      '무주택 요건 확인 필요',
      '소득·자산 기준 공식 공고 확인 필요',
      '공고별 주택목록 확인 필요',
    ],
    documents: ['신청서', '주민등록등본', '소득·자산 확인 서류', '공고별 제출서류 확인 필요'],
    pros: ['공공임대 방식으로 주거비 부담을 줄일 수 있음', '공고별 주택목록을 비교해 선택 가능'],
    cautions: ['모집 물량과 위치는 공고별로 다름', '주택 상태와 입주 가능 시기 확인 필요'],
    canCombineWith: ['서울 청년월세지원'],
    officialUrl: 'https://apply.lh.or.kr/',
    updatedAt,
    sourceName: 'LH청약플러스',
    dataStatus: '공고 확인 필요',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'seoul-youth-safe-housing',
    title: '청년안심주택',
    category: '공공/민간 청년 임대주택',
    region: '서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['청년', '신혼부부'],
    status: '예정',
    supportType: '역세권·간선도로변 청년 임대주택 공급',
    supportAmount: '공고별 상이',
    difficulty: '높음',
    summary: '통학과 출근이 용이한 역세권 및 간선도로변에 공급되는 청년 임대주택',
    bestFor: '서울 역세권에서 통학·출근 접근성을 중요하게 보는 청년',
    conditions: [
      '청년/신혼부부 대상',
      '공공임대/민간임대 유형별 조건 확인 필요',
      '공고별 임대료와 보증금 확인 필요',
    ],
    documents: ['주민등록등본', '소득·자산 확인 서류', '공고별 제출서류 확인 필요'],
    pros: ['역세권 및 간선도로변 접근성이 강점', '공공임대와 민간임대 유형을 함께 확인 가능'],
    cautions: ['민간임대형은 계약 책임 주체와 보증금 반환 관련 사항 확인 필요', '공고별 임대료 차이 확인 필요'],
    canCombineWith: ['청년 임차보증금 이자지원'],
    officialUrl: 'https://housing.seoul.go.kr/site/main/content/sh01_060508',
    updatedAt,
    sourceName: '서울주거포털 / 청년안심주택',
    dataStatus: '공식 확인',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'happy-housing',
    title: '행복주택',
    category: '공공임대',
    region: '전국/서울',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: true,
    targetGroups: ['대학생', '사회초년생', '신혼부부'],
    status: '예정',
    supportType: '공공임대 주택공급',
    supportAmount: '시중 시세의 60~80% 수준',
    difficulty: '높음',
    summary: '대학생, 사회초년생, 신혼부부 등 젊은층을 위한 공공임대주택',
    bestFor: '임대료를 낮추고 안정적인 공공임대 주택을 찾는 청년 1인가구',
    conditions: [
      '공급물량 중 젊은층 우선 공급',
      '소득·자산·무주택 기준 공고별 확인 필요',
      '모집 시기 확인 필요',
    ],
    documents: ['주민등록등본', '가족관계증명서', '소득·자산 확인 서류', '청약 관련 서류'],
    pros: ['시세 대비 낮은 임대조건 가능', '공공임대라 주거 안정성이 높음'],
    cautions: ['공고 시기와 지역별 경쟁률 확인 필요', '소득·자산 기준을 반드시 확인해야 함'],
    canCombineWith: [],
    officialUrl: 'https://housing.seoul.go.kr/site/main/content/sh01_060503',
    updatedAt,
    sourceName: '서울주거포털 / LH청약플러스',
    dataStatus: '공식 확인',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'seongbuk-youth-housing-counseling',
    title: '성북 청년 주거상담/교육',
    category: '첫 독립 가이드',
    region: '서울 성북구',
    ageMin: 19,
    ageMax: 39,
    incomeLevel: '확인 필요',
    housingRequired: false,
    targetGroups: ['사회초년생', '1인 가구', '자립 준비 청년', '성북구 인근 거주 청년'],
    status: '예정',
    supportType: '주거 정보 교육/상담',
    supportAmount: '금전 지원 아님',
    difficulty: '낮음',
    summary: '성북구 인근 청년이 주거 정보를 배우고 상담받을 수 있는 프로그램',
    bestFor: '처음 독립을 준비하며 계약, 보증금, 주거지원 정보를 배우고 싶은 성북구 인근 청년',
    conditions: ['프로그램별 모집 대상과 일정 확인 필요'],
    documents: ['프로그램별 신청서류 확인 필요'],
    pros: ['첫 독립 전 계약과 주거지원 정보를 점검할 수 있음', '성북구 생활권 청년에게 접근성이 좋음'],
    cautions: ['교육·상담 일정은 프로그램별로 달라 공식 페이지 확인 필요'],
    canCombineWith: ['서울 청년월세지원', 'LH 청년매입임대'],
    officialUrl: 'https://youth.seoul.go.kr/',
    updatedAt,
    sourceName: '청년몽땅정보통 / 서울청년센터 성북',
    dataStatus: '공고 확인 필요',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
  {
    id: 'seongbuk-jeonse-fraud-support',
    title: '성북구 전세사기 피해자 지원',
    category: '주거 위기 지원',
    region: '서울 성북구',
    ageMin: 0,
    ageMax: 99,
    incomeLevel: '확인 필요',
    housingRequired: false,
    targetGroups: ['전세사기 피해자'],
    status: '모집중',
    supportType: '보증료, 이사비, 월세, 소송수행경비 등',
    supportAmount: '항목별 상이',
    difficulty: '보통',
    summary: '성북구 소재 전세사기 피해자를 대상으로 주거비와 법적 절차 비용 등을 지원하는 사업',
    bestFor: '성북구 소재 피해주택과 주민등록 요건을 확인해야 하는 전세사기 피해자',
    conditions: [
      '국토교통부장관이 결정한 전세사기피해자',
      '전세사기 피해주택이 성북구 소재',
      '신청일 현재 성북구 주민등록 필요',
      '세부 지원은 공식 공고 확인 필요',
    ],
    documents: ['전세사기피해자 결정문', '주민등록 관련 서류', '피해주택 관련 서류', '항목별 증빙서류 확인 필요'],
    pros: ['주거 위기 상황에서 항목별 비용 지원 가능', '성북구 소재 피해주택 기준으로 확인 가능'],
    cautions: ['청년 전용 사업은 아니지만 성북구 주거 위기지원으로 표시', '항목별 세부 한도와 신청 기간은 공식 공고 확인 필요'],
    canCombineWith: [],
    officialUrl: 'https://www.seongbuk.go.kr/',
    updatedAt,
    sourceName: '성북구청',
    dataStatus: '공고 확인 필요',
    noticeStatus: '공고별 조건이 다를 수 있으니 반드시 공식 공고문을 확인하세요.',
  },
]
