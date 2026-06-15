# 청년 1인가구 가이드맵

처음 혼자 사는 청년 1인가구를 위한 주거지원·생활환경 비교 가이드입니다. 주거지원 공고를 보여주는 데서 끝나지 않고, 이 위치가 내 생활에 맞는지까지 함께 판단할 수 있도록 돕습니다.

## 핵심 화면

- 지도에서 찾기: 행복주택, 청년매입임대, 공공임대, 역세권 청년주택 등 실제 위치가 있는 주거지원 주택을 핀으로 탐색
- 혜택 비교: 청년 월세지원, 버팀목 전세자금대출, 청년 전세임대 등 제도형 혜택을 카드로 비교
- 내 조건 추천: 지역, 생활환경, 이동 기준, 첫 독립 우선순위를 기준으로 주거 옵션을 먼저 추리고 연결 가능한 지원사업을 추천
- 비교함: 지도에서 선택한 집과 혜택 카드를 함께 담아 표로 비교

## 실행 방법

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 데이터 수정

- 위치 기반 주거지원 데이터: `src/data/housingOptions.ts`
- 제도형 혜택 데이터: `src/data/benefits.ts`

MVP 데이터 운영 흐름:

1. 공식 공고 확인
2. 데이터 타입에 맞춰 정보 정리
3. 사이트에 반영
4. `updatedAt`에 마지막 확인일 표시
5. `sourceName`, `officialUrl`에 출처와 공식 링크 연결

현재 샘플 데이터 마지막 확인일은 `2026.06.14`입니다.

## 지도 구현

현재 지도는 Leaflet + OpenStreetMap으로 구현되어 있습니다. 각 주거 옵션은 `lat`, `lng`, `environmentTags`, `environment` 데이터를 가지고 있어 생활환경 필터와 추후 Kakao Local API/공공데이터 연동에 활용할 수 있습니다.

## GitHub Pages 배포

1. GitHub 저장소에 push합니다.
2. `Settings > Pages`로 이동합니다.
3. `Build and deployment`의 `Source`를 `GitHub Actions`로 설정합니다.
4. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 실행됩니다.
5. 워크플로가 `npm ci`, `npm run build` 후 `dist/`를 GitHub Pages에 배포합니다.

`vite.config.ts`는 배포 빌드에서 저장소 이름을 base 경로로 자동 사용합니다.

문의 이메일: smart55447@naver.com
