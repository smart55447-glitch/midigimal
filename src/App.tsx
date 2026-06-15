import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import heroImage from './assets/youth-housing-hero.png'
import {
  benefits,
  type Benefit,
  type BenefitRegion,
  type BenefitStatus,
  type IncomeLevel,
  type SupportPreference,
  type TargetGroup,
} from './data/benefits'
import { housingOptions, type EnvironmentTag, type HousingOption, type HousingType } from './data/housingOptions'
import './App.css'

type Page = 'home' | 'benefits' | 'map' | 'recommend' | 'compare'
type CompareItem = { id: string; kind: 'benefit' | 'housing' }
type SheetTab = 'basic' | 'support' | 'environment' | 'checklist'
type EnvironmentPreference = EnvironmentTag
type MobilityPreference = '지하철역 도보 10분 이내' | '지하철역 도보 15분 이내' | '버스 접근성 중요' | '통학/출근 시간 중요' | '상관없음'
type IndependencePriority =
  | '월세 부담 줄이기'
  | '보증금 부담 줄이기'
  | '학교/직장 가까이 살기'
  | '안전 인프라 확인하기'
  | '생활편의시설 가까이 살기'
  | '공공임대 먼저 보기'

type MapFilter = {
  region: '전체' | BenefitRegion
  sigungu: string
  dong: string
  stationOrLandmark: string
  type: '전체' | HousingType
  status: '전체' | BenefitStatus
  maxRent: number
  maxDeposit: number
  maxWalk: number
  stationAreaOnly: boolean
  environmentTags: EnvironmentTag[]
  safetyInfraOnly: boolean
  targetGroup: '전체' | TargetGroup
  keyword: string
  favoritesOnly: boolean
}

type Condition = {
  region: '전체' | BenefitRegion
  sigungu: string
  dong: string
  stationOrLandmark: string
  age: number
  incomeLevel: IncomeLevel
  noHome: boolean
  targetGroup: TargetGroup
  preference: SupportPreference
  type: '전체' | HousingType
  maxRent: number
  maxDeposit: number
  environmentPreferences: EnvironmentPreference[]
  mobilityPreference: MobilityPreference
  independencePriorities: IndependencePriority[]
}

const regions: Array<'전체' | BenefitRegion> = ['전체', '서울', '경기', '인천', '부산', '기타', '전국']
const housingTypes: Array<'전체' | HousingType> = ['전체', '행복주택', '청년매입임대', '공공임대', '역세권 청년주택', '지자체 청년주택']
const statuses: Array<'전체' | BenefitStatus> = ['전체', '모집중', '예정', '마감']
const targets: Array<'전체' | TargetGroup> = ['전체', '청년', '대학생', '구직자', '직장인', '프리랜서', '전세사기 피해자']
const incomeLevels: IncomeLevel[] = ['낮음', '중간', '확인 필요']
const preferences: SupportPreference[] = ['월세 지원', '전세 대출', '공공임대', '아직 모르겠음']
const environmentPreferences: EnvironmentPreference[] = ['역세권', '대학교 통학권', '직장/도심 접근성', '도서관 근처', '공원/산책로 근처', '병원·약국 근처', '마트·편의점 근처', '공공시설 근처', '안전 인프라 확인']
const mobilityPreferences: MobilityPreference[] = ['지하철역 도보 10분 이내', '지하철역 도보 15분 이내', '버스 접근성 중요', '통학/출근 시간 중요', '상관없음']
const independencePriorities: IndependencePriority[] = ['월세 부담 줄이기', '보증금 부담 줄이기', '학교/직장 가까이 살기', '안전 인프라 확인하기', '생활편의시설 가까이 살기', '공공임대 먼저 보기']

const initialMapFilter: MapFilter = {
  region: '전체',
  sigungu: '전체',
  dong: '전체',
  stationOrLandmark: '전체',
  type: '전체',
  status: '전체',
  maxRent: 40,
  maxDeposit: 3000,
  maxWalk: 15,
  stationAreaOnly: false,
  environmentTags: [],
  safetyInfraOnly: false,
  targetGroup: '전체',
  keyword: '',
  favoritesOnly: false,
}

const initialCondition: Condition = {
  region: '서울',
  sigungu: '전체',
  dong: '전체',
  stationOrLandmark: '전체',
  age: 28,
  incomeLevel: '낮음',
  noHome: true,
  targetGroup: '직장인',
  preference: '월세 지원',
  type: '전체',
  maxRent: 40,
  maxDeposit: 3000,
  environmentPreferences: ['역세권'],
  mobilityPreference: '지하철역 도보 10분 이내',
  independencePriorities: ['월세 부담 줄이기'],
}

const markerColorByType: Record<HousingType, string> = {
  행복주택: '#2f62e6',
  청년매입임대: '#0f8a7a',
  공공임대: '#5b6f91',
  '역세권 청년주택': '#f97316',
  '지자체 청년주택': '#7c3aed',
}

function money(value: number) {
  return `${value.toLocaleString()}만원`
}

function scheduleText(option: HousingOption) {
  if (option.status === '모집중') return '신청 마감일: 공고별 확인'
  if (option.status === '예정') return '모집 예정일: 공고 예정'
  return '모집 마감: 다음 공고 확인'
}

function regionMatch(selected: '전체' | BenefitRegion, region: BenefitRegion) {
  return selected === '전체' || region === '전국' || selected === region || region.includes(selected)
}

function uniqueOptions(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko'))
}

function optionsForLocation(level: 'sigungu' | 'dong' | 'station', region: '전체' | BenefitRegion, sigungu = '전체', dong = '전체') {
  const matched = housingOptions.filter((item) => (
    regionMatch(region, item.sido) &&
    (sigungu === '전체' || item.sigungu === sigungu) &&
    (dong === '전체' || item.dong === dong)
  ))

  if (level === 'sigungu') return ['전체', ...uniqueOptions(matched.map((item) => item.sigungu))]
  if (level === 'dong') return ['전체', ...uniqueOptions(matched.map((item) => item.dong))]
  return ['전체', ...uniqueOptions(matched.flatMap((item) => [item.nearbyStation, ...item.nearbyLandmarks]))]
}

function locationMatches(option: HousingOption, region: '전체' | BenefitRegion, sigungu: string, dong: string, stationOrLandmark: string) {
  return (
    regionMatch(region, option.sido) &&
    (sigungu === '전체' || option.sigungu === sigungu) &&
    (dong === '전체' || option.dong === dong) &&
    (
      stationOrLandmark === '전체' ||
      option.nearbyStation === stationOrLandmark ||
      option.nearestStation === stationOrLandmark ||
      option.nearbyLandmarks.includes(stationOrLandmark)
    )
  )
}

function ageMatch(age: number, min: number, max: number) {
  return age >= min && age <= max
}

function markerIcon(type: HousingType, selected: boolean) {
  const color = markerColorByType[type]

  return L.divIcon({
    className: `housing-marker ${selected ? 'selected' : ''}`,
    html: `<span style="--pin-color:${color}"><b>${type.slice(0, 2)}</b></span>`,
    iconSize: selected ? [48, 48] : [40, 40],
    iconAnchor: selected ? [24, 46] : [20, 38],
    popupAnchor: [0, -34],
  })
}

function connectedBenefits(option: HousingOption) {
  return benefits
    .map((benefit) => {
      if (option.connectedBenefits.includes(benefit.id)) return { benefit, label: benefit.dataStatus === '공식 확인' ? '공식 확인' : '공고 확인 필요' }
      return { benefit, label: '해당 낮음' }
    })
    .filter((item) => item.label !== '해당 낮음')
}

function listText(items: string[]) {
  return items.length ? items.join(', ') : '확인 필요'
}

function environmentBadge(value: string | number | string[]) {
  if (typeof value === 'number') return value >= 5 ? '좋음' : '보통'
  const text = Array.isArray(value) ? value.join(' ') : value
  if (text.includes('확인 필요') || text.includes('공공데이터')) return '확인 필요'
  if (text.includes('안심') || text.includes('지구대') || text.includes('파출소')) return '안전 인프라 확인됨'
  return '보통'
}

function busStopText(value: number | '확인 필요') {
  return typeof value === 'number' ? `${value}개` : value
}

function toggleListValue<T extends string>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
}

function optionMatchesEnvironment(option: HousingOption, preference: EnvironmentPreference) {
  if (option.environmentTags.includes(preference)) return true
  const env = option.environment
  if (preference === '역세권') return option.walkingMinutesToStation <= 10
  if (preference === '대학교 통학권') return !env.education.nearbyUniversities.join(' ').includes('확인 필요')
  if (preference === '직장/도심 접근성') return option.walkingMinutesToStation <= 12
  if (preference === '도서관 근처') return !env.publicFacilities.libraries.join(' ').includes('확인 필요')
  if (preference === '공원/산책로 근처') return !env.dailyLife.parks.join(' ').includes('확인 필요')
  if (preference === '병원·약국 근처') return ![...env.dailyLife.hospitals, ...env.dailyLife.pharmacies].join(' ').includes('확인 필요')
  if (preference === '마트·편의점 근처') return !env.dailyLife.marts.join(' ').includes('확인 필요')
  if (preference === '공공시설 근처') return !env.publicFacilities.communityCenters.join(' ').includes('확인 필요')
  return !`${env.safetyInfra.safeReturnRoad} ${env.safetyInfra.policeOffice}`.includes('확인 필요')
}

function optionMatchesAllEnvironmentTags(option: HousingOption, tags: EnvironmentTag[]) {
  return tags.every((tag) => optionMatchesEnvironment(option, tag))
}

function independenceChecklist(condition: Condition) {
  const items = [
    '월세와 관리비를 함께 확인했어요',
    '전입신고 가능 여부를 확인했어요',
    '확정일자 필요 여부를 확인했어요',
    '등기부등본/권리관계를 확인했어요',
    '공고별 소득·자산 기준을 확인했어요',
  ]
  if (condition.mobilityPreference !== '상관없음') items.push('실제 통학·출근 동선을 확인했어요')
  if (condition.environmentPreferences.length === 0) items.push('생활환경 조건을 선택하면 지도에서 함께 확인할 수 있어요.')
  if (condition.environmentPreferences.includes('역세권')) items.push('역 출입구까지의 실제 도보 동선을 확인했어요')
  if (condition.environmentPreferences.some((item) => ['도서관 근처', '공원/산책로 근처'].includes(item))) items.push('도서관·공원 접근성을 지도 상세 카드에서 확인했어요')
  if (condition.environmentPreferences.includes('마트·편의점 근처') || condition.independencePriorities.includes('생활편의시설 가까이 살기')) items.push('마트·편의점, 병원·약국 같은 생활편의시설을 확인했어요')
  if (condition.independencePriorities.includes('안전 인프라 확인하기')) items.push('안심귀갓길, CCTV/비상벨, 지구대/파출소 접근성을 확인했어요')
  return items
}

function mapFilterChips(filter: MapFilter) {
  const chips: Array<{ key: string; label: string }> = []
  if (filter.region !== '전체') chips.push({ key: 'region', label: filter.region })
  if (filter.sigungu !== '전체') chips.push({ key: 'sigungu', label: filter.sigungu })
  if (filter.dong !== '전체') chips.push({ key: 'dong', label: filter.dong })
  if (filter.stationOrLandmark !== '전체') chips.push({ key: 'stationOrLandmark', label: filter.stationOrLandmark })
  if (filter.type !== '전체') chips.push({ key: 'type', label: filter.type })
  if (filter.status !== '전체') chips.push({ key: 'status', label: filter.status })
  if (filter.maxRent < initialMapFilter.maxRent) chips.push({ key: 'maxRent', label: `월세 ${filter.maxRent}만 원 이하` })
  if (filter.maxDeposit < initialMapFilter.maxDeposit) chips.push({ key: 'maxDeposit', label: `보증금 ${filter.maxDeposit}만 원 이하` })
  if (filter.maxWalk < initialMapFilter.maxWalk) chips.push({ key: 'maxWalk', label: `역까지 ${filter.maxWalk}분 이내` })
  if (filter.stationAreaOnly) chips.push({ key: 'stationAreaOnly', label: '역까지 10분' })
  filter.environmentTags.forEach((tag) => chips.push({ key: `environment:${tag}`, label: tag }))
  if (filter.safetyInfraOnly) chips.push({ key: 'safetyInfraOnly', label: '안전 인프라만' })
  if (filter.targetGroup !== '전체') chips.push({ key: 'targetGroup', label: filter.targetGroup })
  if (filter.keyword.trim()) chips.push({ key: 'keyword', label: `키워드 ${filter.keyword.trim()}` })
  if (filter.favoritesOnly) chips.push({ key: 'favoritesOnly', label: '저장 목록' })
  return chips
}

function removeMapFilterChip(filter: MapFilter, key: string): MapFilter {
  if (key === 'region') return { ...filter, region: '전체', sigungu: '전체', dong: '전체', stationOrLandmark: '전체' }
  if (key === 'sigungu') return { ...filter, sigungu: '전체', dong: '전체', stationOrLandmark: '전체' }
  if (key === 'dong') return { ...filter, dong: '전체', stationOrLandmark: '전체' }
  if (key === 'stationOrLandmark') return { ...filter, stationOrLandmark: '전체' }
  if (key === 'type') return { ...filter, type: '전체' }
  if (key === 'status') return { ...filter, status: '전체' }
  if (key === 'maxRent') return { ...filter, maxRent: initialMapFilter.maxRent }
  if (key === 'maxDeposit') return { ...filter, maxDeposit: initialMapFilter.maxDeposit }
  if (key === 'maxWalk') return { ...filter, maxWalk: initialMapFilter.maxWalk }
  if (key === 'stationAreaOnly') return { ...filter, stationAreaOnly: false }
  if (key.startsWith('environment:')) return { ...filter, environmentTags: filter.environmentTags.filter((tag) => tag !== key.replace('environment:', '')) }
  if (key === 'safetyInfraOnly') return { ...filter, safetyInfraOnly: false }
  if (key === 'targetGroup') return { ...filter, targetGroup: '전체' }
  if (key === 'keyword') return { ...filter, keyword: '' }
  if (key === 'favoritesOnly') return { ...filter, favoritesOnly: false }
  return filter
}

function conditionSummary(condition: Condition) {
  return [
    condition.region !== '전체' ? condition.region : null,
    condition.sigungu !== '전체' ? condition.sigungu : null,
    condition.dong !== '전체' ? condition.dong : null,
    condition.stationOrLandmark !== '전체' ? `${condition.stationOrLandmark} 근처` : null,
    condition.type !== '전체' ? condition.type : null,
    condition.maxRent < initialCondition.maxRent ? `월세 ${condition.maxRent}만 원 이하` : null,
    condition.maxDeposit < initialCondition.maxDeposit ? `보증금 ${condition.maxDeposit}만 원 이하` : null,
    condition.mobilityPreference !== '상관없음' ? condition.mobilityPreference : null,
    ...condition.environmentPreferences.slice(0, 3),
    ...condition.independencePriorities.slice(0, 2),
  ].filter(Boolean).join(' · ')
}

function conditionChips(condition: Condition) {
  const chips: Array<{ key: string; label: string }> = []
  if (condition.region !== '전체') chips.push({ key: 'region', label: condition.region })
  if (condition.sigungu !== '전체') chips.push({ key: 'sigungu', label: condition.sigungu })
  if (condition.dong !== '전체') chips.push({ key: 'dong', label: condition.dong })
  if (condition.stationOrLandmark !== '전체') chips.push({ key: 'stationOrLandmark', label: condition.stationOrLandmark })
  if (condition.type !== '전체') chips.push({ key: 'type', label: condition.type })
  if (condition.maxRent < initialCondition.maxRent) chips.push({ key: 'maxRent', label: `월세 ${condition.maxRent}만 원 이하` })
  if (condition.maxDeposit < initialCondition.maxDeposit) chips.push({ key: 'maxDeposit', label: `보증금 ${condition.maxDeposit}만 원 이하` })
  if (condition.mobilityPreference !== '상관없음') chips.push({ key: 'mobilityPreference', label: condition.mobilityPreference })
  condition.environmentPreferences.forEach((tag) => chips.push({ key: `environment:${tag}`, label: tag }))
  condition.independencePriorities.forEach((item) => chips.push({ key: `priority:${item}`, label: item }))
  if (condition.noHome) chips.push({ key: 'noHome', label: '무주택' })
  if (condition.targetGroup !== '청년') chips.push({ key: 'targetGroup', label: condition.targetGroup })
  return chips
}

function removeConditionChip(condition: Condition, key: string): Condition {
  if (key === 'region') return { ...condition, region: '전체', sigungu: '전체', dong: '전체', stationOrLandmark: '전체' }
  if (key === 'sigungu') return { ...condition, sigungu: '전체', dong: '전체', stationOrLandmark: '전체' }
  if (key === 'dong') return { ...condition, dong: '전체', stationOrLandmark: '전체' }
  if (key === 'stationOrLandmark') return { ...condition, stationOrLandmark: '전체' }
  if (key === 'type') return { ...condition, type: '전체' }
  if (key === 'maxRent') return { ...condition, maxRent: initialCondition.maxRent }
  if (key === 'maxDeposit') return { ...condition, maxDeposit: initialCondition.maxDeposit }
  if (key === 'mobilityPreference') return { ...condition, mobilityPreference: '상관없음' }
  if (key.startsWith('environment:')) return { ...condition, environmentPreferences: condition.environmentPreferences.filter((tag) => tag !== key.replace('environment:', '')) }
  if (key.startsWith('priority:')) return { ...condition, independencePriorities: condition.independencePriorities.filter((item) => item !== key.replace('priority:', '')) }
  if (key === 'noHome') return { ...condition, noHome: false }
  if (key === 'targetGroup') return { ...condition, targetGroup: '청년' }
  return condition
}

function scoreHousing(condition: Condition, option: HousingOption) {
  let score = 0
  if (regionMatch(condition.region, option.region)) score += 24
  if (ageMatch(condition.age, option.ageMin, option.ageMax)) score += 18
  if (condition.noHome === option.requiresNoHome) score += 14
  if (option.targetGroups.includes(condition.targetGroup)) score += 16
  if (option.incomeLevel === condition.incomeLevel || option.incomeLevel === '확인 필요') score += 10
  if (condition.preference === '공공임대') score += 16
  if (condition.mobilityPreference === '지하철역 도보 10분 이내' && option.walkingMinutesToStation <= 10) score += 14
  if (condition.mobilityPreference === '지하철역 도보 15분 이내' && option.walkingMinutesToStation <= 15) score += 10
  if (condition.mobilityPreference === '통학/출근 시간 중요' && option.walkingMinutesToStation <= 12) score += 8
  condition.environmentPreferences.forEach((preference) => {
    if (optionMatchesEnvironment(option, preference)) score += 6
  })
  if (condition.independencePriorities.includes('월세 부담 줄이기') && option.monthlyRent <= 20) score += 10
  if (condition.independencePriorities.includes('보증금 부담 줄이기') && option.deposit <= 1200) score += 8
  if (condition.independencePriorities.includes('공공임대 먼저 보기') && ['행복주택', '청년매입임대', '공공임대'].includes(option.type)) score += 10
  if (option.status === '모집중') score += 10
  return score
}

function FlyToSelected({ option }: { option: HousingOption }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([option.lat, option.lng], 14, { duration: 0.65 })
  }, [map, option.lat, option.lng])

  return null
}

function MapEmptyClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => onMapClick(),
  })

  return null
}

function MapToolButtons({
  favoriteCount,
  favoritesOnly,
  onGeoMessage,
  onReset,
  onToggleFavorites,
  selectedHousing,
}: {
  favoriteCount: number
  favoritesOnly: boolean
  onGeoMessage: (message: string) => void
  onReset: () => void
  onToggleFavorites: () => void
  selectedHousing: HousingOption
}) {
  const map = useMap()

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      onGeoMessage('현재 위치를 지원하지 않는 브라우저입니다.')
      return
    }

    onGeoMessage('현재 위치를 확인하는 중입니다.')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.flyTo([position.coords.latitude, position.coords.longitude], 14)
        onGeoMessage('현재 위치로 지도를 이동했습니다.')
      },
      () => onGeoMessage('위치 권한이 거부되었거나 현재 위치를 가져올 수 없습니다.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="map-tools" aria-label="지도 도구" onClick={(event) => event.stopPropagation()}>
      <button onClick={moveToCurrentLocation} type="button">현재 위치</button>
      <button onClick={() => onGeoMessage(`${selectedHousing.name}을 즐겨찾기에 담거나 해제할 수 있습니다.`)} type="button">
        즐겨찾기
      </button>
      <button className={favoritesOnly ? 'active' : ''} onClick={onToggleFavorites} type="button">
        저장 목록 {favoriteCount}
      </button>
      <button onClick={onReset} type="button">지도 초기화</button>
    </div>
  )
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [mapFilter, setMapFilter] = useState<MapFilter>(initialMapFilter)
  const [condition, setCondition] = useState<Condition>(initialCondition)
  const [selectedHousingId, setSelectedHousingId] = useState<string | null>(housingOptions[0].id)
  const [lastSelectedHousingId, setLastSelectedHousingId] = useState(housingOptions[0].id)
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [compareItems, setCompareItems] = useState<CompareItem[]>([])
  const [compareHydrated, setCompareHydrated] = useState(false)
  const [favoriteHousingIds, setFavoriteHousingIds] = useState<string[]>([])
  const [geoMessage, setGeoMessage] = useState('')

  useEffect(() => {
    try {
      const savedHousingIds = JSON.parse(window.localStorage.getItem('housingCompareItems') ?? '[]') as string[]
      setCompareItems(savedHousingIds.slice(0, 4).map((id) => ({ kind: 'housing', id })))
    } catch {
      setCompareItems([])
    }
    setCompareHydrated(true)
  }, [])

  useEffect(() => {
    if (!compareHydrated) return
    const housingIds = compareItems.filter((item) => item.kind === 'housing').map((item) => item.id)
    window.localStorage.setItem('housingCompareItems', JSON.stringify(housingIds.slice(0, 4)))
  }, [compareHydrated, compareItems])

  const selectedHousing = selectedHousingId ? housingOptions.find((item) => item.id === selectedHousingId) ?? null : null
  const lastSelectedHousing = housingOptions.find((item) => item.id === lastSelectedHousingId) ?? housingOptions[0]

  const filteredHousing = useMemo(() => {
    const keyword = mapFilter.keyword.trim().toLowerCase()

    return housingOptions.filter((item) => {
      const searchable = [item.name, item.address, item.nearestStation, item.nearbyStation, item.region, item.sigungu, item.dong, ...item.nearbyLandmarks, item.type, item.bestFor]
        .join(' ')
        .toLowerCase()

      return (
        locationMatches(item, mapFilter.region, mapFilter.sigungu, mapFilter.dong, mapFilter.stationOrLandmark) &&
        (mapFilter.type === '전체' || mapFilter.type === item.type) &&
        (mapFilter.status === '전체' || mapFilter.status === item.status) &&
        item.monthlyRentNumber <= mapFilter.maxRent &&
        item.depositNumber <= mapFilter.maxDeposit &&
        item.walkingMinutesToStation <= mapFilter.maxWalk &&
        (!mapFilter.stationAreaOnly || item.walkingMinutesToStation <= 10) &&
        optionMatchesAllEnvironmentTags(item, mapFilter.environmentTags) &&
        (!mapFilter.safetyInfraOnly || optionMatchesEnvironment(item, '안전 인프라 확인')) &&
        (mapFilter.targetGroup === '전체' || item.targetGroups.includes(mapFilter.targetGroup)) &&
        (!keyword || searchable.includes(keyword)) &&
        (!mapFilter.favoritesOnly || favoriteHousingIds.includes(item.id))
      )
    })
  }, [favoriteHousingIds, mapFilter])

  const comparedBenefits = compareItems
    .filter((item) => item.kind === 'benefit')
    .map((item) => benefits.find((benefit) => benefit.id === item.id))
    .filter((item): item is Benefit => Boolean(item))

  const comparedHousing = compareItems
    .filter((item) => item.kind === 'housing')
    .map((item) => housingOptions.find((housing) => housing.id === item.id))
    .filter((item): item is HousingOption => Boolean(item))

  const openPage = (nextPage: Page) => {
    setPage(nextPage)
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const toggleCompare = (kind: CompareItem['kind'], id: string) => {
    setCompareItems((current) => {
      const exists = current.some((item) => item.kind === kind && item.id === id)
      if (exists) return current.filter((item) => !(item.kind === kind && item.id === id))
      if (kind === 'housing' && current.filter((item) => item.kind === 'housing').length >= 4) {
        window.alert('최대 4개까지 비교할 수 있어요.')
        return current
      }
      return [...current, { kind, id }]
    })
  }

  const addHousingCompare = (id: string) => {
    setCompareItems((current) => {
      if (current.some((item) => item.kind === 'housing' && item.id === id)) {
        window.alert('이미 비교함에 담긴 주거 옵션입니다.')
        return current
      }
      if (current.filter((item) => item.kind === 'housing').length >= 4) {
        window.alert('최대 4개까지 비교할 수 있어요.')
        return current
      }
      return [...current, { kind: 'housing', id }]
    })
  }

  const toggleFavoriteHousing = (id: string) => {
    setFavoriteHousingIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  const isCompared = (kind: CompareItem['kind'], id: string) =>
    compareItems.some((item) => item.kind === kind && item.id === id)

  const selectHousing = (id: string) => {
    setSelectedHousingId(id)
    setLastSelectedHousingId(id)
  }

  return (
    <main className="app-shell">
      <Header compareCount={comparedHousing.length} openPage={openPage} page={page} />
      {page === 'home' && <HomePage openPage={openPage} toggleCompare={toggleCompare} />}
      {page === 'benefits' && <BenefitsPage isCompared={isCompared} setSelectedBenefit={setSelectedBenefit} toggleCompare={toggleCompare} />}
      {page === 'map' && (
        <MapPage
          favoriteHousingIds={favoriteHousingIds}
          filter={mapFilter}
          filteredHousing={filteredHousing}
          geoMessage={geoMessage}
          isCompared={isCompared}
          lastSelectedHousing={lastSelectedHousing}
          restoreLastHousing={() => setSelectedHousingId(lastSelectedHousing.id)}
          selectedHousing={selectedHousing}
          setFilter={setMapFilter}
          setGeoMessage={setGeoMessage}
          setSelectedHousingId={selectHousing}
          closeSelectedHousing={() => setSelectedHousingId(null)}
          toggleCompare={addHousingCompare}
          toggleFavoriteHousing={toggleFavoriteHousing}
        />
      )}
      {page === 'recommend' && (
        <RecommendPage
          condition={condition}
          setCondition={setCondition}
          setPage={openPage}
          setSelectedHousingId={selectHousing}
          isCompared={isCompared}
          addHousingCompare={addHousingCompare}
          toggleCompare={toggleCompare}
        />
      )}
      {page === 'compare' && (
        <ComparePage
          comparedBenefits={comparedBenefits}
          comparedHousing={comparedHousing}
          compareItems={compareItems}
          openPage={openPage}
          setCompareItems={setCompareItems}
        />
      )}
      <Footer />
      {selectedBenefit && <BenefitModal benefit={selectedBenefit} onClose={() => setSelectedBenefit(null)} />}
    </main>
  )
}

function Header({ compareCount, openPage, page }: { compareCount: number; openPage: (page: Page) => void; page: Page }) {
  const items: Array<[Page, string]> = [
    ['home', '홈'],
    ['benefits', '혜택 비교'],
    ['map', '지도로 비교하기'],
    ['recommend', '내 조건 추천'],
    ['compare', `비교함 ${compareCount}`],
  ]

  return (
    <header className="site-header">
      <button className="brand" onClick={() => openPage('home')} type="button">청년 1인가구 가이드맵</button>
      <nav aria-label="주요 메뉴">
        {items.map(([key, label]) => (
          <button className={page === key ? 'active' : ''} key={key} onClick={() => openPage(key)} type="button">
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}

function HomePage({ openPage, toggleCompare }: { openPage: (page: Page) => void; toggleCompare: (kind: CompareItem['kind'], id: string) => void }) {
  return (
    <>
      <section className="landing-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(20, 31, 48, 0.72), rgba(20, 31, 48, 0.1)), url(${heroImage})` }}>
        <div className="hero-content">
          <p>청년 1인가구 가이드맵</p>
          <h1>처음 혼자 사는 청년을 위한 거주 가이드맵</h1>
          <strong>처음 혼자 사는 청년 1인가구를 위한 주거지원·생활환경 비교 가이드</strong>
          <span>주거지원, 공공임대, 월세지원뿐 아니라 역세권, 통학권, 공원·도서관·생활편의시설까지 함께 비교해 나에게 맞는 거주 선택지를 찾아보세요.</span>
          <div>
            <button onClick={() => openPage('recommend')} type="button">내 조건으로 추천받기</button>
            <button onClick={() => openPage('map')} type="button">지도로 생활환경 보기</button>
          </div>
        </div>
      </section>

      <section className="quick-menu" aria-label="빠른 메뉴">
        <div className="contact-card">
          <span>문의 이메일</span>
          <strong>smart55447@naver.com</strong>
        </div>
        {[
            ['혜택 비교', '혜택', 'benefits'],
            ['지도·생활환경', '지도', 'map'],
            ['내 조건 추천', '추천', 'recommend'],
            ['비교함', '비교', 'compare'],
        ].map(([label, icon, key]) => (
          <button key={label} onClick={() => openPage(key as Page)} type="button">
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </section>

      <section className="blue-strip">
        <strong>지금 신청 가능한 혜택 {benefits.filter((item) => item.status === '모집중').length}개</strong>
        <span>마지막 확인일 2026.06.14 · 출처 LH / 복지로 / 지자체 공식 홈페이지</span>
      </section>

      <section className="landing-section">
        <div className="section-copy">
          <p>POPULAR BENEFITS</p>
          <h2>지원받을 수 있는 집인지, 살기 괜찮은 위치인지 함께 확인하세요.</h2>
          <span>집을 고를 때 중요한 건 지원금만이 아니에요. 역까지의 거리, 학교·직장 접근성, 공원과 도서관, 병원·약국 같은 생활환경까지 함께 봐야 처음 독립이 덜 막막해져요.</span>
        </div>
        <div className="feature-grid">
          {benefits.slice(0, 3).map((benefit) => (
            <article className="feature-card" key={benefit.id}>
              <span>{benefit.status}</span>
              <span className="data-status">{benefit.dataStatus}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.summary}</p>
              <small>출처: {benefit.sourceName} · 마지막 확인일: {benefit.updatedAt}</small>
              <small>{benefit.noticeStatus}</small>
              <button onClick={() => toggleCompare('benefit', benefit.id)} type="button">지원사업 비교에 담기</button>
            </article>
          ))}
        </div>
      </section>

      <section className="dark-section">
        <div className="section-copy">
          <p>WHY THIS MATTERS</p>
          <h2>지원사업, 위치, 생활환경, 첫 독립 판단을 함께 봅니다.</h2>
          <span>청년 1인가구 가이드맵은 공고를 보여주는 데서 끝나지 않고, 이 위치가 내 생활에 맞는지까지 판단할 수 있도록 도와줍니다.</span>
        </div>
        <div className="dark-cards">
          <article><strong>주거지원 비교</strong><span>청년 월세지원, 행복주택, 청년매입임대, 버팀목 전세대출처럼 헷갈리는 제도를 조건별로 비교해요.</span></article>
          <article><strong>지도 기반 주택 탐색</strong><span>LH·공공임대·청년주택 위치를 지도에서 보고, 역과의 거리와 주변 생활환경을 함께 확인해요.</span></article>
          <article><strong>생활환경 분석</strong><span>공원, 도서관, 병원·약국, 마트·편의점, 공공시설, 안전 인프라 접근성을 함께 살펴봐요.</span></article>
          <article><strong>첫 독립 판단</strong><span>처음 혼자 살 때 필요한 월세 부담, 통학·출근 접근성, 계약 전 체크리스트까지 함께 확인해요.</span></article>
        </div>
      </section>

      <section className="landing-section centered">
        <div className="section-copy">
          <p>SERVICE</p>
          <h2>지도에서 찾은 집과 받을 수 있는 혜택, 생활환경을 연결합니다.</h2>
          <span>청년 1인가구 가이드맵은 주거지원 공고를 보여주는 데서 끝나지 않고, 이 위치가 내 생활에 맞는지까지 함께 판단할 수 있도록 도와줍니다.</span>
        </div>
      </section>
    </>
  )
}

function MapPage({
  closeSelectedHousing,
  favoriteHousingIds,
  filter,
  filteredHousing,
  geoMessage,
  isCompared,
  lastSelectedHousing,
  restoreLastHousing,
  selectedHousing,
  setFilter,
  setGeoMessage,
  setSelectedHousingId,
  toggleCompare,
  toggleFavoriteHousing,
}: {
  closeSelectedHousing: () => void
  favoriteHousingIds: string[]
  filter: MapFilter
  filteredHousing: HousingOption[]
  geoMessage: string
  isCompared: (kind: CompareItem['kind'], id: string) => boolean
  lastSelectedHousing: HousingOption
  restoreLastHousing: () => void
  selectedHousing: HousingOption | null
  setFilter: (filter: MapFilter) => void
  setGeoMessage: (message: string) => void
  setSelectedHousingId: (id: string) => void
  toggleCompare: (id: string) => void
  toggleFavoriteHousing: (id: string) => void
}) {
  const activeHousing = selectedHousing ?? lastSelectedHousing
  const selectedIsFavorite = favoriteHousingIds.includes(activeHousing.id)
  const chips = mapFilterChips(filter)
  const sigunguOptions = optionsForLocation('sigungu', filter.region)
  const dongOptions = optionsForLocation('dong', filter.region, filter.sigungu)
  const stationOptions = optionsForLocation('station', filter.region, filter.sigungu, filter.dong)
  const updateEnvironmentFilter = (tag: EnvironmentTag) => {
    setFilter({ ...filter, environmentTags: toggleListValue(filter.environmentTags, tag) })
  }

  const resetMap = () => {
    setFilter(initialMapFilter)
    setSelectedHousingId(housingOptions[0].id)
    setGeoMessage('지도와 필터를 초기화했습니다.')
  }

  const toggleFavoritesOnly = () => {
    if (favoriteHousingIds.length === 0 && !filter.favoritesOnly) {
      setGeoMessage('저장된 주택이 없습니다. 먼저 선택 카드에서 즐겨찾기를 눌러보세요.')
      return
    }
    setFilter({ ...filter, favoritesOnly: !filter.favoritesOnly })
  }

  return (
    <section className="map-explorer">
      <div className="map-searchbar" role="search">
        <input
          aria-label="지역명, 역명, 학교명, 키워드 검색"
          onChange={(event) => setFilter({ ...filter, keyword: event.target.value })}
          placeholder="지역명, 역명, 학교명, 키워드 검색"
          value={filter.keyword}
        />
        <span>{filteredHousing.length}개 주거지원</span>
      </div>

      <div className="map-chipbar" aria-label="지도 필터">
        <label className={filter.region !== '전체' ? 'active' : ''}>시/도
          <select value={filter.region} onChange={(event) => setFilter({ ...filter, region: event.target.value as MapFilter['region'], sigungu: '전체', dong: '전체', stationOrLandmark: '전체' })}>
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.sigungu !== '전체' ? 'active' : ''}>시/군/구
          <select value={filter.sigungu} onChange={(event) => setFilter({ ...filter, sigungu: event.target.value, dong: '전체', stationOrLandmark: '전체' })}>
            {sigunguOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.dong !== '전체' ? 'active' : ''}>읍/면/동
          <select value={filter.dong} onChange={(event) => setFilter({ ...filter, dong: event.target.value, stationOrLandmark: '전체' })}>
            {dongOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.stationOrLandmark !== '전체' ? 'active' : ''}>역/랜드마크
          <select value={filter.stationOrLandmark} onChange={(event) => setFilter({ ...filter, stationOrLandmark: event.target.value })}>
            {stationOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.type !== '전체' ? 'active' : ''}>지원 유형
          <select value={filter.type} onChange={(event) => setFilter({ ...filter, type: event.target.value as MapFilter['type'] })}>
            {housingTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.status !== '전체' ? 'active' : ''}>모집 상태
          <select value={filter.status} onChange={(event) => setFilter({ ...filter, status: event.target.value as MapFilter['status'] })}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={filter.maxRent < 40 ? 'active' : ''}>월 임대료 {filter.maxRent}만원
          <input max="60" min="10" onChange={(event) => setFilter({ ...filter, maxRent: Number(event.target.value) })} type="range" value={filter.maxRent} />
        </label>
        <label className={filter.maxDeposit < 3000 ? 'active' : ''}>보증금 {filter.maxDeposit}만원
          <input max="5000" min="500" step="100" onChange={(event) => setFilter({ ...filter, maxDeposit: Number(event.target.value) })} type="range" value={filter.maxDeposit} />
        </label>
        <label className={filter.maxWalk < 15 ? 'active' : ''}>역까지 {filter.maxWalk}분
          <input max="20" min="3" onChange={(event) => setFilter({ ...filter, maxWalk: Number(event.target.value) })} type="range" value={filter.maxWalk} />
        </label>
        <label className={filter.targetGroup !== '전체' ? 'active' : ''}>대상
          <select value={filter.targetGroup} onChange={(event) => setFilter({ ...filter, targetGroup: event.target.value as MapFilter['targetGroup'] })}>
            {targets.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <button className={filter.stationAreaOnly ? 'active' : ''} onClick={() => setFilter({ ...filter, stationAreaOnly: !filter.stationAreaOnly })} type="button">
          역까지 10분
        </button>
        {environmentPreferences.map((tag) => (
          <button className={filter.environmentTags.includes(tag) ? 'active' : ''} key={tag} onClick={() => updateEnvironmentFilter(tag)} type="button">
            {tag}
          </button>
        ))}
        <button className={filter.safetyInfraOnly ? 'active' : ''} onClick={() => setFilter({ ...filter, safetyInfraOnly: !filter.safetyInfraOnly })} type="button">
          안전 인프라만
        </button>
      </div>

      <div className="selected-filter-panel">
        <div>
          <strong>선택한 조건 {chips.length}개 · {filteredHousing.length}개 결과</strong>
          <span>{filteredHousing.length > 0 ? '조건에 맞는 주거 옵션을 찾고 있어요.' : '조건을 줄이면 더 많은 주거 옵션을 볼 수 있어요.'}</span>
        </div>
        {chips.length > 0 && (
          <div className="filter-chip-row" aria-label="선택한 조건">
            {chips.map((chip) => (
              <button key={chip.key} onClick={() => setFilter(removeMapFilterChip(filter, chip.key))} type="button">
                {chip.label} <span>×</span>
              </button>
            ))}
            <button className="reset-chip" onClick={() => setFilter(initialMapFilter)} type="button">전체 초기화</button>
          </div>
        )}
      </div>

      <div className="map-stage">
        <MapContainer center={[37.5665, 126.978]} className="leaflet-map" scrollWheelZoom zoom={11}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEmptyClickHandler onMapClick={closeSelectedHousing} />
          {selectedHousing && <FlyToSelected option={selectedHousing} />}
          <MapToolButtons
            favoriteCount={favoriteHousingIds.length}
            favoritesOnly={filter.favoritesOnly}
            onGeoMessage={setGeoMessage}
            onReset={resetMap}
            onToggleFavorites={toggleFavoritesOnly}
            selectedHousing={activeHousing}
          />
          {filteredHousing.map((option) => {
            const selected = selectedHousing?.id === option.id

            return (
              <Marker
                eventHandlers={{
                  click: (event) => {
                    L.DomEvent.stop(event.originalEvent)
                    setSelectedHousingId(option.id)
                  },
                }}
                icon={markerIcon(option.type, selected)}
                key={option.id}
                position={[option.lat, option.lng]}
              >
                <Popup>
                  <strong>{option.name}</strong>
                  <br />
                  {option.nearestStation} 도보 {option.walkingMinutesToStation}분
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        {filteredHousing.length === 0 && (
          <div className="map-empty-message">
            조건에 맞는 주거 옵션이 없어요. 지역, 역까지 거리, 생활환경 조건을 조금 줄여보세요.
          </div>
        )}
        {geoMessage && <div className="map-message">{geoMessage}</div>}
        <HousingBottomSheet
          isCompared={isCompared('housing', activeHousing.id)}
          isFavorite={selectedIsFavorite}
          key={`${selectedHousing ? 'open' : 'collapsed'}-${activeHousing.id}`}
          onClose={closeSelectedHousing}
          onRestore={restoreLastHousing}
          option={selectedHousing}
          fallbackOption={lastSelectedHousing}
          toggleCompare={() => toggleCompare(activeHousing.id)}
          toggleFavorite={() => toggleFavoriteHousing(activeHousing.id)}
        />
      </div>
    </section>
  )
}

function HousingBottomSheet({
  fallbackOption,
  isCompared,
  isFavorite,
  onClose,
  onRestore,
  option,
  toggleCompare,
  toggleFavorite,
}: {
  fallbackOption: HousingOption
  isCompared: boolean
  isFavorite: boolean
  onClose: () => void
  onRestore: () => void
  option: HousingOption | null
  toggleCompare: () => void
  toggleFavorite: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<SheetTab>('basic')

  if (!option) {
    return (
      <article className="housing-bottom-sheet collapsed">
        <button className="sheet-collapsed-bar" onClick={onRestore} type="button">
          <span className="sheet-grip" />
          <strong>주택을 선택하면 상세 정보가 표시됩니다</strong>
          <small>최근 선택: {fallbackOption.name}</small>
        </button>
      </article>
    )
  }

  const tabs: Array<[SheetTab, string]> = [
    ['basic', '기본정보'],
    ['support', '지원정보'],
    ['environment', '주변환경'],
    ['checklist', '체크리스트'],
  ]
  const env = option.environment

  return (
    <article className={`housing-bottom-sheet open ${expanded ? 'expanded' : ''}`}>
      <button
        aria-label={expanded ? '상세 카드 접기' : '상세 카드 펼치기'}
        className="sheet-handle"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <span />
      </button>
      <button aria-label="상세 카드 닫기" className="sheet-close" onClick={onClose} type="button">×</button>
      <nav className="sheet-tabs" aria-label="주택 상세 정보 탭">
        {tabs.map(([key, label]) => (
          <button
            className={activeTab === key ? 'active' : ''}
            key={key}
            onClick={() => {
              setActiveTab(key)
              if (key !== 'basic') setExpanded(true)
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'basic' && (
        <div className="sheet-panel basic">
          <div className="sheet-summary">
            <span className={`status status-${option.status}`}>{option.status}</span>
            <span className="data-status">{option.dataStatus}</span>
            <h2>{option.name}</h2>
            <p>{option.address}</p>
            <strong>{option.nearestStation} 도보 {option.walkingMinutesToStation}분</strong>
            <small>{option.summary}</small>
            <small>출처: {option.sourceName} · 마지막 확인일: {option.updatedAt}</small>
            <small>{option.noticeStatus}</small>
          </div>
          <div className="sheet-condition-grid">
            <dl>
              <div><dt>지원 유형</dt><dd>{option.type}</dd></div>
              <div><dt>보증금</dt><dd>{money(option.deposit)}</dd></div>
              <div><dt>월 임대료</dt><dd>{money(option.monthlyRent)}</dd></div>
              <div><dt>일정</dt><dd>{scheduleText(option)}</dd></div>
              <div><dt>추천 대상</dt><dd>{option.bestFor}</dd></div>
              <div><dt>난이도</dt><dd>{option.difficulty}</dd></div>
              <div><dt>데이터 상태</dt><dd>{option.dataStatus}</dd></div>
            </dl>
          </div>
          <div className="sheet-side">
            <div className="sheet-actions">
              <a href={option.officialUrl} rel="noreferrer" target="_blank">공식 링크</a>
              <button className={isFavorite ? 'selected secondary' : 'secondary'} onClick={toggleFavorite} type="button">
                {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
              </button>
              <button className={isCompared ? 'selected' : ''} onClick={toggleCompare} type="button">
                {isCompared ? '비교함에 담김' : '비교함에 담기'}
              </button>
            </div>
            <section className="sheet-benefits">
              <h3>이 주택과 연결 가능한 혜택</h3>
              {connectedBenefits(option).map(({ benefit, label }) => (
                <div key={benefit.id}><span>{benefit.title}</span><strong>{label}</strong></div>
              ))}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="sheet-panel support">
          <div className="sheet-condition-grid">
            <dl>
              <div><dt>지원 유형</dt><dd>{option.type}</dd></div>
              <div><dt>모집 상태</dt><dd>{option.status}</dd></div>
              <div><dt>보증금</dt><dd>{money(option.deposit)}</dd></div>
              <div><dt>월 임대료</dt><dd>{money(option.monthlyRent)}</dd></div>
              <div><dt>나이 조건</dt><dd>만 {option.ageMin}~{option.ageMax}세</dd></div>
              <div><dt>무주택 조건</dt><dd>{option.requiresNoHome ? '필요' : '공고별 확인'}</dd></div>
              <div><dt>공식 출처</dt><dd>{option.sourceName}</dd></div>
              <div><dt>마지막 확인일</dt><dd>{option.updatedAt}</dd></div>
            </dl>
          </div>
          <section className="sheet-benefits">
            <h3>이 주택과 연결 가능한 혜택</h3>
            {connectedBenefits(option).map(({ benefit, label }) => (
              <div key={benefit.id}><span>{benefit.title}</span><strong>{label}</strong></div>
            ))}
          </section>
        </div>
      )}

      {activeTab === 'environment' && (
        <div className="sheet-panel environment">
          <section className="env-card">
            <div><strong>교통 편의</strong><span>{environmentBadge(env.transit.busStopCountNearby)}</span></div>
            <p>{env.transit.nearestStation} 도보 {env.transit.walkingMinutesToStation}분 · 버스 정류장 {busStopText(env.transit.busStopCountNearby)}</p>
          </section>
          <section className="env-card">
            <div><strong>통학 접근성</strong><span>{environmentBadge(env.education.nearbyUniversities)}</span></div>
            <p>{listText(env.education.nearbyUniversities)} · {env.education.commuteNotes}</p>
          </section>
          <section className="env-card">
            <div><strong>공공시설</strong><span>{environmentBadge([...env.publicFacilities.libraries, ...env.publicFacilities.communityCenters])}</span></div>
            <p>도서관: {listText(env.publicFacilities.libraries)} · 주민센터/공공시설: {listText(env.publicFacilities.communityCenters)}</p>
          </section>
          <section className="env-card">
            <div><strong>생활 편의</strong><span>{environmentBadge([...env.dailyLife.marts, ...env.dailyLife.pharmacies])}</span></div>
            <p>공원: {listText(env.dailyLife.parks)} · 병원/약국: {listText([...env.dailyLife.hospitals, ...env.dailyLife.pharmacies])} · 마트/편의점: {listText(env.dailyLife.marts)}</p>
          </section>
          <section className="env-card">
            <div><strong>안전 인프라</strong><span>{environmentBadge(`${env.safetyInfra.safeReturnRoad} ${env.safetyInfra.policeOffice}`)}</span></div>
            <p>{env.safetyInfra.safeReturnRoad} · {env.safetyInfra.cctvOrEmergencyBell} · {env.safetyInfra.policeOffice}</p>
            <small>{env.safetyInfra.note}</small>
          </section>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="sheet-panel checklist">
          <section>
            <h3>입주 전 확인할 것</h3>
            <ul>
              {option.cautions.map((item) => <li key={item}>{item}</li>)}
              <li>CCTV/비상벨, 안심귀갓길, 야간 귀가 동선을 공공데이터 또는 현장 방문으로 확인하세요.</li>
              <li>도서관, 병원/약국, 마트/편의점은 실제 생활 반경 기준으로 다시 확인하세요.</li>
            </ul>
          </section>
        </div>
      )}
    </article>
  )
}

function BenefitsPage({ isCompared, setSelectedBenefit, toggleCompare }: {
  isCompared: (kind: CompareItem['kind'], id: string) => boolean
  setSelectedBenefit: (benefit: Benefit) => void
  toggleCompare: (kind: CompareItem['kind'], id: string) => void
}) {
  return (
    <section className="content-page">
      <div className="section-copy">
        <p>BENEFIT COMPARE</p>
        <h1>지원사업과 거주 조건을 한눈에 비교해드려요.</h1>
      </div>
      <div className="benefit-grid">
        {benefits.map((benefit) => (
          <article className="benefit-card" key={benefit.id}>
            <span className={`status status-${benefit.status}`}>{benefit.status}</span>
            <span className="data-status">{benefit.dataStatus}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.summary}</p>
            <dl>
              <div><dt>지원 방식</dt><dd>{benefit.supportType}</dd></div>
              <div><dt>지원 금액</dt><dd>{benefit.supportAmount}</dd></div>
              <div><dt>대상</dt><dd>{benefit.targetGroups.join(', ')}</dd></div>
              <div><dt>신청 조건</dt><dd>{benefit.conditions.join(', ')}</dd></div>
              <div><dt>신청 난이도</dt><dd>{benefit.difficulty}</dd></div>
              <div><dt>중복 가능</dt><dd>{benefit.canCombineWith.length ? benefit.canCombineWith.join(', ') : '공고별 확인'}</dd></div>
              <div><dt>출처</dt><dd>{benefit.sourceName}</dd></div>
              <div><dt>마지막 확인일</dt><dd>{benefit.updatedAt}</dd></div>
            </dl>
            <small>{benefit.noticeStatus}</small>
            <a href={benefit.officialUrl} rel="noreferrer" target="_blank">공식 링크: {benefit.sourceName}</a>
            <div className="button-row">
              <button className={isCompared('benefit', benefit.id) ? 'selected' : ''} onClick={() => toggleCompare('benefit', benefit.id)} type="button">
                {isCompared('benefit', benefit.id) ? '지원사업 비교에서 빼기' : '지원사업 비교에 담기'}
              </button>
              <button onClick={() => setSelectedBenefit(benefit)} type="button">상세보기</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function recommendationReason(condition: Condition, title: string) {
  const homeText = condition.noHome ? '무주택 조건' : '주거 조건'
  const locationText = [condition.region, condition.sigungu !== '전체' ? condition.sigungu : null, condition.stationOrLandmark !== '전체' ? `${condition.stationOrLandmark} 근처` : null].filter(Boolean).join(' ')
  const envText = condition.environmentPreferences.length ? ` ${condition.environmentPreferences.slice(0, 2).join(', ')} 조건도 함께 봅니다.` : ''
  return `추천 이유: ${locationText} · 만 ${condition.age}세 · ${homeText}을 기준으로 ${title}을 먼저 확인할 필요가 있어요.${envText}`
}

function officialBenefitRecommendations(condition: Condition) {
  const entries: Array<{ id: string; reason: string; priority: number }> = []
  const isSeoul = condition.region === '서울' || condition.region === '서울 성북구' || condition.sigungu !== '전체'
  const isSeongbuk = condition.sigungu === '성북구' || condition.region === '서울 성북구'

  if (isSeoul && condition.independencePriorities.includes('월세 부담 줄이기')) {
    entries.push({
      id: 'seoul-youth-monthly-rent',
      priority: 100,
      reason: '서울 거주 청년이고 월세 부담 줄이기를 선택했기 때문에 청년월세지원을 우선 확인하도록 추천했어요.',
    })
  }

  if (isSeoul && condition.independencePriorities.includes('보증금 부담 줄이기')) {
    entries.push({
      id: 'seoul-youth-deposit-interest',
      priority: 95,
      reason: '서울 거주 청년이고 보증금 부담 줄이기를 선택했기 때문에 청년 임차보증금 이자지원을 함께 확인하도록 추천했어요.',
    })
  }

  if (isSeoul && (condition.preference === '공공임대' || condition.type === '청년매입임대')) {
    entries.push({
      id: 'lh-youth-purchase-rental',
      priority: 90,
      reason: '서울 지역에서 공공임대나 매입임대 관심 조건이 있어 LH 청년매입임대 공고를 확인하도록 추천했어요.',
    })
  }

  if (isSeoul && (condition.preference === '공공임대' || condition.type === '행복주택' || condition.independencePriorities.includes('공공임대 먼저 보기'))) {
    entries.push({
      id: 'happy-housing',
      priority: 88,
      reason: '공공임대 관심 조건이 있어 행복주택 모집 시기와 자격 기준을 함께 확인하도록 추천했어요.',
    })
  }

  if (isSeongbuk && condition.independencePriorities.length > 0) {
    entries.push({
      id: 'seongbuk-youth-housing-counseling',
      priority: 86,
      reason: '성북구를 선택했고 첫 독립 준비 조건이 있어 성북 청년 주거상담/교육을 함께 확인하도록 추천했어요.',
    })
  }

  if (isSeongbuk && condition.targetGroup === '전세사기 피해자') {
    entries.push({
      id: 'seongbuk-jeonse-fraud-support',
      priority: 120,
      reason: '성북구를 선택했고 전세사기 피해 상황을 선택했기 때문에 성북구 전세사기 피해자 지원을 우선 안내해요.',
    })
  }

  const unique = new Map<string, { item: Benefit; label: string; reason: string; priority: number }>()
  entries.forEach((entry) => {
    const benefit = benefits.find((item) => item.id === entry.id)
    if (!benefit) return
    const previous = unique.get(entry.id)
    if (!previous || entry.priority > previous.priority) {
      unique.set(entry.id, { item: benefit, label: benefit.dataStatus, reason: entry.reason, priority: entry.priority })
    }
  })

  return Array.from(unique.values()).sort((a, b) => b.priority - a.priority)
}

function ContractChecklist({ items }: { items: string[] }) {
  const storageKey = 'youth-single-household-contract-checklist'
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  const readStoredItems = () => {
    try {
      const saved = window.localStorage?.getItem(storageKey)
      if (saved) return JSON.parse(saved) as string[]
    } catch {
      // localStorage can be unavailable in some embedded browser contexts.
    }

    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${storageKey}=`))
      ?.split('=')[1]

    if (!cookieValue) return []
    try {
      return JSON.parse(decodeURIComponent(cookieValue)) as string[]
    } catch {
      return []
    }
  }

  const writeStoredItems = (nextItems: string[]) => {
    const serialized = JSON.stringify(nextItems)
    try {
      window.localStorage?.setItem(storageKey, serialized)
      return
    } catch {
      // Fall through to cookie storage.
    }
    document.cookie = `${storageKey}=${encodeURIComponent(serialized)}; path=/; max-age=31536000; samesite=lax`
  }

  useEffect(() => {
    setCheckedItems(readStoredItems())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const validCheckedItems = checkedItems.filter((item) => items.includes(item))
    if (validCheckedItems.length !== checkedItems.length) {
      setCheckedItems(validCheckedItems)
      return
    }
    writeStoredItems(validCheckedItems)
  }, [checkedItems, items])

  const toggleItem = (item: string) => {
    setCheckedItems((current) => (
      current.includes(item) ? current.filter((checked) => checked !== item) : [...current, item]
    ))
  }
  const completedCount = checkedItems.filter((item) => items.includes(item)).length
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <section className="contract-checklist">
      <div className="contract-checklist-head">
        <span>필수</span>
        <div>
          <h2>계약 전 꼭 확인하세요</h2>
          <p>총 {items.length}개 중 {completedCount}개 완료</p>
        </div>
      </div>
      <div className="check-progress" aria-label={`체크리스트 완료율 ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <ul>
        {items.map((item) => {
          const checked = checkedItems.includes(item)
          return (
            <li className={checked ? 'done' : ''} key={item}>
              <label>
                <input checked={checked} onChange={() => toggleItem(item)} type="checkbox" />
                <span>{item}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function RecommendPage({ addHousingCompare, condition, isCompared, setCondition, setPage, setSelectedHousingId, toggleCompare }: {
  addHousingCompare: (id: string) => void
  condition: Condition
  isCompared: (kind: CompareItem['kind'], id: string) => boolean
  setCondition: (condition: Condition) => void
  setPage: (page: Page) => void
  setSelectedHousingId: (id: string) => void
  toggleCompare: (kind: CompareItem['kind'], id: string) => void
}) {
  const [submittedCondition, setSubmittedCondition] = useState<Condition | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const recommendedHousing = useMemo(() => {
    if (!submittedCondition) return []
    return [...housingOptions]
      .filter((item) => (
        locationMatches(item, submittedCondition.region, submittedCondition.sigungu, submittedCondition.dong, submittedCondition.stationOrLandmark) &&
        (submittedCondition.type === '전체' || item.type === submittedCondition.type) &&
        item.monthlyRentNumber <= submittedCondition.maxRent &&
        item.depositNumber <= submittedCondition.maxDeposit &&
        ageMatch(submittedCondition.age, item.ageMin, item.ageMax) &&
        (!submittedCondition.noHome || item.requiresNoHome) &&
        item.targetGroups.includes(submittedCondition.targetGroup) &&
        optionMatchesAllEnvironmentTags(item, submittedCondition.environmentPreferences) &&
        (submittedCondition.mobilityPreference === '상관없음' ||
          (submittedCondition.mobilityPreference === '지하철역 도보 10분 이내' && item.walkingMinutesToStation <= 10) ||
          (submittedCondition.mobilityPreference === '지하철역 도보 15분 이내' && item.walkingMinutesToStation <= 15) ||
          (submittedCondition.mobilityPreference === '버스 접근성 중요') ||
          (submittedCondition.mobilityPreference === '통학/출근 시간 중요' && item.walkingMinutesToStation <= 15))
      ))
      .map((item) => ({ item, score: scoreHousing(submittedCondition, item) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
  }, [submittedCondition])

  const connectedRecommendedBenefits = useMemo(() => {
    if (!submittedCondition) return []
    const official = officialBenefitRecommendations(submittedCondition)
    const linked = recommendedHousing.flatMap(({ item }) => connectedBenefits(item).map(({ benefit, label }) => ({ item: benefit, label })))
    const unique = new Map<string, { item: Benefit; label: string; reason: string }>()
    official.forEach((entry) => {
      unique.set(entry.item.id, { item: entry.item, label: entry.label, reason: entry.reason })
    })
    linked.forEach((entry) => {
      if (!unique.has(entry.item.id)) {
        unique.set(entry.item.id, {
          item: entry.item,
          label: entry.label,
          reason: '추천 주거 옵션과 연결 가능한 지원사업입니다. 공고별 조건을 공식 페이지에서 확인하세요.',
        })
      }
    })
    return Array.from(unique.values()).slice(0, 3)
  }, [recommendedHousing, submittedCondition])

  const checklistItems = useMemo(() => (
    submittedCondition ? independenceChecklist(submittedCondition) : []
  ), [submittedCondition])

  const updateCondition = (nextCondition: Condition) => {
    setCondition(nextCondition)
    if (submittedCondition) setIsDirty(true)
  }

  const submitRecommendation = () => {
    setSubmittedCondition(condition)
    setIsDirty(false)
  }

  const resetCondition = () => {
    setCondition(initialCondition)
    setSubmittedCondition(null)
    setIsDirty(false)
  }

  const updateEnvironmentPreference = (item: EnvironmentPreference) => {
    updateCondition({ ...condition, environmentPreferences: toggleListValue(condition.environmentPreferences, item) })
  }

  const updateIndependencePriority = (item: IndependencePriority) => {
    updateCondition({ ...condition, independencePriorities: toggleListValue(condition.independencePriorities, item) })
  }

  const sigunguOptions = optionsForLocation('sigungu', condition.region)
  const dongOptions = optionsForLocation('dong', condition.region, condition.sigungu)
  const stationOptions = optionsForLocation('station', condition.region, condition.sigungu, condition.dong)
  const submittedConditionChips = submittedCondition ? conditionChips(submittedCondition) : []

  return (
    <section className="recommend-page">
      <aside className="condition-panel">
        <h2>내 조건 입력</h2>
        <label>시/도<select value={condition.region} onChange={(event) => updateCondition({ ...condition, region: event.target.value as Condition['region'], sigungu: '전체', dong: '전체', stationOrLandmark: '전체' })}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>시/군/구<select value={condition.sigungu} onChange={(event) => updateCondition({ ...condition, sigungu: event.target.value, dong: '전체', stationOrLandmark: '전체' })}>{sigunguOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>읍/면/동<select value={condition.dong} onChange={(event) => updateCondition({ ...condition, dong: event.target.value, stationOrLandmark: '전체' })}>{dongOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>역/랜드마크<select value={condition.stationOrLandmark} onChange={(event) => updateCondition({ ...condition, stationOrLandmark: event.target.value })}>{stationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>나이<input min="19" max="45" type="number" value={condition.age} onChange={(event) => updateCondition({ ...condition, age: Number(event.target.value) })} /></label>
        <label>소득<select value={condition.incomeLevel} onChange={(event) => updateCondition({ ...condition, incomeLevel: event.target.value as IncomeLevel })}>{incomeLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>상태<select value={condition.targetGroup} onChange={(event) => updateCondition({ ...condition, targetGroup: event.target.value as TargetGroup })}>{targets.filter((item): item is TargetGroup => item !== '전체').map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>희망 지원<select value={condition.preference} onChange={(event) => updateCondition({ ...condition, preference: event.target.value as SupportPreference })}>{preferences.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>지원 유형<select value={condition.type} onChange={(event) => updateCondition({ ...condition, type: event.target.value as Condition['type'] })}>{housingTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>월 임대료 {condition.maxRent}만원 이하<input max="60" min="10" onChange={(event) => updateCondition({ ...condition, maxRent: Number(event.target.value) })} type="range" value={condition.maxRent} /></label>
        <label>보증금 {condition.maxDeposit}만원 이하<input max="5000" min="500" step="100" onChange={(event) => updateCondition({ ...condition, maxDeposit: Number(event.target.value) })} type="range" value={condition.maxDeposit} /></label>
        <label className="checkline"><input checked={condition.noHome} onChange={(event) => updateCondition({ ...condition, noHome: event.target.checked })} type="checkbox" />무주택자입니다</label>
        <div className="condition-group">
          <strong>중요하게 보는 생활환경</strong>
          <div className="condition-check-grid">
            {environmentPreferences.map((item) => (
              <label className="checkline" key={item}>
                <input checked={condition.environmentPreferences.includes(item)} onChange={() => updateEnvironmentPreference(item)} type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </div>
        <label>이동 기준
          <select value={condition.mobilityPreference} onChange={(event) => updateCondition({ ...condition, mobilityPreference: event.target.value as MobilityPreference })}>
            {mobilityPreferences.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div className="condition-group">
          <strong>첫 독립 우선순위</strong>
          <div className="condition-check-grid">
            {independencePriorities.map((item) => (
              <label className="checkline" key={item}>
                <input checked={condition.independencePriorities.includes(item)} onChange={() => updateIndependencePriority(item)} type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </div>
        {isDirty && <p className="dirty-notice">조건이 변경되었어요. 다시 추천받기를 눌러주세요.</p>}
        <div className="recommend-cta-row">
          <button className="recommend-submit" onClick={submitRecommendation} type="button">내 조건으로 추천받기</button>
          <button className="recommend-reset" onClick={resetCondition} type="button">조건 초기화</button>
        </div>
      </aside>
      <div className="recommend-results">
        {!submittedCondition ? (
          <div className="recommend-empty">
            지역, 생활환경, 이동 기준, 첫 독립 우선순위를 입력하면 조건에 맞는 주거 옵션을 먼저 추리고 연결 가능한 지원사업을 추천해드려요.
          </div>
        ) : (
          <>
            <div className="recommend-result-heading">
              <span>선택한 조건 요약</span>
              <strong>{conditionSummary(submittedCondition)}</strong>
              <small>먼저 선택한 조건에 맞는 주거 옵션을 추렸고, 그다음 연결 가능한 지원사업을 추천했어요.</small>
              <div className="filter-chip-row" aria-label="추천에 적용된 조건">
                {submittedConditionChips.map((chip) => (
                  <button key={chip.key} onClick={() => {
                    const nextCondition = removeConditionChip(submittedCondition, chip.key)
                    setCondition(nextCondition)
                    setSubmittedCondition(nextCondition)
                  }} type="button">
                    {chip.label} <span>×</span>
                  </button>
                ))}
                <button className="reset-chip" onClick={resetCondition} type="button">전체 초기화</button>
              </div>
            </div>
            <section>
              <h2>조건에 맞는 추천 주거 옵션</h2>
              {recommendedHousing.length === 0 && (
                <div className="empty-state">조건에 맞는 주거 옵션이 없어요. 생활환경 조건이나 역까지 거리 기준을 조금 줄여보세요.</div>
              )}
              {recommendedHousing.map(({ item }, index) => (
                <article className="mini-card" key={item.id}>
                  <span>추천 {index + 1}순위 · {item.dataStatus}</span>
                  <h3>{item.name}</h3>
                  <p>{item.nearestStation} 도보 {item.walkingMinutesToStation}분 · 월 {money(item.monthlyRent)}</p>
                  <small>{recommendationReason(submittedCondition, item.name)}</small>
                  <small>출처: {item.sourceName} · 마지막 확인일: {item.updatedAt}</small>
                  <small>{item.noticeStatus}</small>
                  <div className="button-row">
                    <button onClick={() => { setSelectedHousingId(item.id); setPage('map') }} type="button">지도에서 주변환경 확인하기</button>
                    <button className={isCompared('housing', item.id) ? 'selected' : ''} onClick={() => addHousingCompare(item.id)} type="button">
                      {isCompared('housing', item.id) ? '비교함에 담김' : '비교함에 담기'}
                    </button>
                  </div>
                </article>
              ))}
            </section>
            <section>
              <h2>이 주거 옵션과 연결 가능한 지원사업</h2>
              {connectedRecommendedBenefits.map(({ item, label, reason }) => (
                <article className="mini-card" key={item.id}>
                  <span>{label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <small>{reason}</small>
                  <small>출처: {item.sourceName} · 마지막 확인일: {item.updatedAt}</small>
                  <small>{item.noticeStatus}</small>
                  <a href={item.officialUrl} rel="noreferrer" target="_blank">공식 링크 보기</a>
                  <button onClick={() => toggleCompare('benefit', item.id)} type="button">지원사업 비교에 담기</button>
                </article>
              ))}
            </section>
            <ContractChecklist items={checklistItems} />
          </>
        )}
      </div>
    </section>
  )
}

function ComparePage({ comparedBenefits, comparedHousing, compareItems, openPage, setCompareItems }: {
  comparedBenefits: Benefit[]
  comparedHousing: HousingOption[]
  compareItems: CompareItem[]
  openPage: (page: Page) => void
  setCompareItems: (items: CompareItem[]) => void
}) {
  const removeCompareItem = (kind: CompareItem['kind'], id: string) => {
    setCompareItems(compareItems.filter((item) => !(item.kind === kind && item.id === id)))
  }
  const clearHousingItems = () => {
    setCompareItems(compareItems.filter((item) => item.kind !== 'housing'))
  }

  return (
    <section className="content-page compare-page">
      <div className="section-copy">
        <p>COMPARE</p>
        <h1>스크랩한 집 비교하기</h1>
        <span>지도와 조건 추천에서 담아둔 주거 옵션을 비용, 지원 가능성, 생활환경 기준으로 한눈에 비교해보세요.</span>
        <strong>{comparedHousing.length}/4개 주거 옵션 선택</strong>
      </div>
      {comparedHousing.length > 0 && <button className="clear-button" onClick={clearHousingItems} type="button">주거 옵션 전체 비우기</button>}
      {comparedHousing.length === 0 && (
        <div className="empty-state compare-empty">
          <p>아직 비교할 주거 옵션이 없어요. 지도나 내 조건 추천에서 마음에 드는 집을 비교함에 담아보세요.</p>
          <div className="button-row">
            <button onClick={() => openPage('map')} type="button">지도로 주거 옵션 찾기</button>
            <button onClick={() => openPage('recommend')} type="button">내 조건으로 추천받기</button>
          </div>
        </div>
      )}
      {comparedHousing.length > 0 && <CompareHousingTable items={comparedHousing} onRemove={(id) => removeCompareItem('housing', id)} />}
      {comparedBenefits.length > 0 && (
        <section className="secondary-compare">
          <div className="section-copy">
            <p>OPTIONAL</p>
            <h2>지원사업 비교</h2>
            <span>지원사업 카드는 보조 정보로만 비교합니다. 집 선택은 위의 주거 옵션 비교표를 기준으로 확인하세요.</span>
          </div>
          <CompareBenefitTable items={comparedBenefits} onRemove={(id) => removeCompareItem('benefit', id)} />
        </section>
      )}
    </section>
  )
}

function CompareHousingTable({ items, onRemove }: { items: HousingOption[]; onRemove: (id: string) => void }) {
  const hasTag = (item: HousingOption, tag: EnvironmentTag) => item.environmentTags.includes(tag) ? '해당' : '확인 필요'
  const linkedBenefitText = (item: HousingOption) => connectedBenefits(item).map(({ benefit, label }) => `${benefit.title} (${label})`).join(', ') || '공식 공고 확인 필요'
  const burdenText = (value: number, low: number, high: number) => {
    if (value <= low) return '낮음'
    if (value <= high) return '보통'
    return '높음'
  }
  const rows: Array<{ group: string; label: string; get: (item: HousingOption) => ReactNode }> = [
    { group: '기본 정보', label: '주거 옵션명', get: (item) => item.name },
    { group: '기본 정보', label: '지원 유형', get: (item) => item.type },
    { group: '기본 정보', label: '지역/주소', get: (item) => `${item.sido} ${item.sigungu} ${item.dong} · ${item.address}` },
    { group: '기본 정보', label: '데이터 상태', get: (item) => item.dataStatus },
    { group: '기본 정보', label: '공식 출처', get: (item) => item.sourceName },
    { group: '기본 정보', label: '마지막 확인일', get: (item) => item.updatedAt },
    { group: '비용', label: '보증금', get: (item) => money(item.deposit) },
    { group: '비용', label: '월 임대료', get: (item) => money(item.monthlyRent) },
    { group: '비용', label: '관리비 여부', get: () => '공고 확인 필요' },
    { group: '비용', label: '비용 정보 상태', get: (item) => item.dataStatus },
    { group: '지원 가능성', label: '연결 가능한 지원사업', get: linkedBenefitText },
    { group: '지원 가능성', label: '청년 월세지원 확인', get: (item) => item.connectedBenefits.includes('seoul-youth-monthly-rent') ? '조건 확인 필요' : '공고 확인 필요' },
    { group: '지원 가능성', label: '청년매입임대 해당', get: (item) => item.type === '청년매입임대' ? '해당' : '해당 낮음' },
    { group: '지원 가능성', label: '행복주택 해당', get: (item) => item.type === '행복주택' ? '해당' : '해당 낮음' },
    { group: '지원 가능성', label: '청년안심주택 해당', get: (item) => item.type === '역세권 청년주택' ? '확인 필요' : '해당 낮음' },
    { group: '지원 가능성', label: '버팀목 전세대출 확인', get: (item) => item.deposit >= 1500 ? '확인 필요' : '해당 낮음' },
    { group: '지원 가능성', label: '무주택 조건 필요', get: (item) => item.requiresNoHome ? '필요' : '공고별 확인' },
    { group: '지원 가능성', label: '공식 공고 확인', get: (item) => item.noticeStatus },
    { group: '생활환경', label: '가까운 역', get: (item) => item.nearestStation },
    { group: '생활환경', label: '역까지 도보 시간', get: (item) => `${item.walkingMinutesToStation}분` },
    { group: '생활환경', label: '역세권 여부', get: (item) => item.walkingMinutesToStation <= 10 ? '역세권' : '확인 필요' },
    { group: '생활환경', label: '대학교 통학권', get: (item) => hasTag(item, '대학교 통학권') },
    { group: '생활환경', label: '도서관 근처', get: (item) => hasTag(item, '도서관 근처') },
    { group: '생활환경', label: '공원/산책로 근처', get: (item) => hasTag(item, '공원/산책로 근처') },
    { group: '생활환경', label: '병원·약국 근처', get: (item) => hasTag(item, '병원·약국 근처') },
    { group: '생활환경', label: '마트·편의점 근처', get: (item) => hasTag(item, '마트·편의점 근처') },
    { group: '생활환경', label: '공공시설 근처', get: (item) => hasTag(item, '공공시설 근처') },
    { group: '생활환경', label: '안전 인프라 확인', get: (item) => hasTag(item, '안전 인프라 확인') },
    { group: '첫 독립 체크', label: '월세 부담 정도', get: (item) => burdenText(item.monthlyRentNumber, 20, 35) },
    { group: '첫 독립 체크', label: '보증금 부담 정도', get: (item) => burdenText(item.depositNumber, 1200, 2500) },
    { group: '첫 독립 체크', label: '통학/출근 접근성', get: (item) => item.walkingMinutesToStation <= 10 ? '좋음' : '확인 필요' },
    { group: '첫 독립 체크', label: '생활편의성', get: (item) => item.environmentTags.includes('마트·편의점 근처') ? '확인됨' : '공고/지도 확인 필요' },
    { group: '첫 독립 체크', label: '안전 인프라 확인 필요', get: () => 'CCTV/비상벨·안심귀갓길 공식 데이터 확인 필요' },
    { group: '첫 독립 체크', label: '계약 전 체크 필요 항목', get: () => '등기부등본, 전입신고, 확정일자, 보증금 보호 확인' },
    { group: '첫 독립 체크', label: '공식 공고', get: (item) => <a href={item.officialUrl} rel="noreferrer" target="_blank">공식 공고 보기</a> },
  ]
  let previousGroup = ''

  return (
    <div className="table-wrap">
      <h2>내가 고른 집들을 알기 쉽게 한눈에 비교해드립니다.</h2>
      <p className="compare-notice">보증금, 월 임대료, 모집 일정은 공고별로 달라질 수 있으니 반드시 공식 공고문을 확인하세요.</p>
      <table>
        <thead>
          <tr>
            <th>항목</th>
            {items.map((item) => (
              <th key={item.id}>
                <div className="compare-head-cell">
                  <span className="data-status">{item.dataStatus}</span>
                  <strong>{item.name}</strong>
                  <button onClick={() => onRemove(item.id)} type="button">삭제</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const showGroup = previousGroup !== row.group
            previousGroup = row.group
            return (
              <tr key={`${row.group}-${row.label}`}>
                <th>{showGroup && <span className="compare-row-group">{row.group}</span>}{row.label}</th>
                {items.map((item) => <td key={item.id}>{row.get(item)}</td>)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CompareBenefitTable({ items, onRemove }: { items: Benefit[]; onRemove: (id: string) => void }) {
  const rows: Array<{ label: string; get: (item: Benefit) => ReactNode }> = [
    { label: '지원 방식', get: (item) => item.supportType },
    { label: '지원 금액', get: (item) => item.supportAmount },
    { label: '대상', get: (item) => item.targetGroups.join(', ') },
    { label: '신청 조건', get: (item) => item.conditions.join(', ') },
    { label: '난이도', get: (item) => item.difficulty },
    { label: '모집 상태', get: (item) => item.status },
    { label: '중복 가능', get: (item) => item.canCombineWith.length ? item.canCombineWith.join(', ') : '공고별 확인' },
    { label: '데이터 상태', get: (item) => item.dataStatus },
    { label: '공식 출처', get: (item) => item.sourceName },
    { label: '마지막 확인일', get: (item) => item.updatedAt },
    { label: '공식 링크', get: (item) => <a href={item.officialUrl} rel="noreferrer" target="_blank">공식 링크 보기</a> },
    { label: '안내 문구', get: (item) => item.noticeStatus },
  ]

  return (
    <div className="table-wrap">
      <h2>지원사업 비교</h2>
      <table>
        <thead><tr><th>항목</th>{items.map((item) => <th key={item.id}>{item.title}<button onClick={() => onRemove(item.id)} type="button">삭제</button></th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th>{items.map((item) => <td key={item.id}>{row.get(item)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function BenefitModal({ benefit, onClose }: { benefit: Benefit; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section aria-labelledby="modal-title" aria-modal="true" className="modal" onMouseDown={(event) => event.stopPropagation()} role="dialog">
        <button className="modal-close" onClick={onClose} type="button">닫기</button>
        <h2 id="modal-title">{benefit.title}</h2>
        <p>{benefit.summary}</p>
        <div className="modal-grid">
          <Detail title="누가 신청하면 좋은지" items={[benefit.bestFor]} />
          <Detail title="장점" items={benefit.pros} />
          <Detail title="주의할 점" items={benefit.cautions} />
          <Detail title="준비 서류" items={benefit.documents} />
        </div>
      </section>
    </div>
  )
}

function Detail({ title, items }: { title: string; items: string[] }) {
  return <div className="detail-block"><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}

function Footer() {
  return (
    <footer className="footer">
      <div><strong>청년 1인가구 가이드맵</strong><span>처음 혼자 사는 청년 1인가구를 위한 주거지원·생활환경 비교 가이드 · 마지막 확인일: 2026.06.14</span></div>
      <div className="footer-contact"><span>문의 이메일</span><a href="mailto:smart55447@naver.com">smart55447@naver.com</a></div>
    </footer>
  )
}

export default App
