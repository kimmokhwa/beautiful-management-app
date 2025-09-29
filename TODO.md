# 원가관리 웹 시스템 개발 TODO

## 📋 프로젝트 완성을 위한 단계별 할일

### ✅ **Phase 0: 환경 설정** (완료)
- [x] 프로젝트 구조 생성
- [x] Supabase 환경변수 설정
- [x] 기본 package.json 파일 생성

---

## 🚀 **Phase 1: 기본 인프라 구축** (1주차)

### 백엔드 기본 설정
- [ ] `backend/src/index.ts` - Express 서버 기본 설정
- [ ] `backend/tsconfig.json` - TypeScript 설정
- [ ] `backend/prisma/schema.prisma` - Prisma 스키마 정의
- [ ] Supabase 데이터베이스 연결 테스트
- [ ] CORS 및 미들웨어 설정

### 데이터베이스 스키마
- [ ] Categories 테이블 생성
- [ ] Materials 테이블 생성
- [ ] Procedures 테이블 생성
- [ ] Procedure_Materials 연결 테이블 생성
- [ ] Upload_Jobs 테이블 생성 (대량 업로드용)
- [ ] 기본 카테고리 시드 데이터 삽입

### 프론트엔드 기본 설정
- [ ] `frontend/vite.config.ts` - Vite 설정
- [ ] `frontend/tsconfig.json` - TypeScript 설정
- [ ] `frontend/tailwind.config.js` - Tailwind CSS 설정
- [ ] `frontend/src/main.tsx` - React 앱 진입점
- [ ] Supabase 클라이언트 설정
- [ ] 기본 라우팅 구조

---

## 🔧 **Phase 2: 핵심 기능 개발** (2주차)

### 백엔드 API 구현
- [ ] **재료 관리 API**
  - [ ] `GET /api/materials` - 재료 목록 조회
  - [ ] `POST /api/materials` - 재료 생성
  - [ ] `PUT /api/materials/:id` - 재료 수정
  - [ ] `DELETE /api/materials/:id` - 재료 삭제

- [ ] **시술 관리 API**
  - [ ] `GET /api/procedures` - 시술 목록 조회
  - [ ] `POST /api/procedures` - 시술 생성
  - [ ] `PUT /api/procedures/:id` - 시술 수정
  - [ ] `DELETE /api/procedures/:id` - 시술 삭제

- [ ] **대량 업로드 API (핵심)**
  - [ ] `POST /api/upload/materials` - 재료 대량 업로드
  - [ ] `POST /api/upload/procedures` - 시술 대량 업로드
  - [ ] `POST /api/upload/validate` - 업로드 전 데이터 검증
  - [ ] `GET /api/upload/progress/:jobId` - 업로드 진행상황
  - [ ] Excel/CSV 파일 파싱 로직
  - [ ] 백그라운드 작업 큐 설정 (Bull + Redis)

- [ ] **통계/대시보드 API**
  - [ ] `GET /api/dashboard/stats` - 전체 통계
  - [ ] `GET /api/dashboard/top-margin` - 마진 TOP 5
  - [ ] `GET /api/dashboard/top-margin-rate` - 마진율 TOP 5

### 원가/마진 계산 로직
- [ ] 시술별 총 원가 자동 계산
- [ ] 마진 = 고객가 - 총원가 계산
- [ ] 마진율 = (마진/고객가) × 100 계산
- [ ] 실시간 재계산 트리거

---

## 🎨 **Phase 3: 프론트엔드 UI 개발** (3주차)

### 대시보드 페이지
- [ ] `frontend/src/pages/Dashboard.tsx`
- [ ] KPI 카드 4개 컴포넌트
  - [ ] 총 시술수 카드
  - [ ] 평균 마진율 카드
  - [ ] 최고 마진 카드
  - [ ] 추천 제품수 카드
- [ ] 마진 TOP 5 차트 컴포넌트 (Recharts)
- [ ] 마진율 TOP 5 차트 컴포넌트
- [ ] 추천 제품 관리 섹션

### 시술 관리 페이지
- [ ] `frontend/src/pages/Procedures.tsx`
- [ ] 시술 목록 테이블 (페이지네이션)
- [ ] 검색/필터링 기능
- [ ] 시술 추가/수정 모달
- [ ] 마진율별 색상 구분 표시

### 재료 관리 페이지
- [ ] `frontend/src/pages/Materials.tsx`
- [ ] 재료 목록 테이블
- [ ] 인라인 편집 기능
- [ ] 재료 추가 폼
- [ ] 가격 변경 히스토리

### **대량 업로드 페이지** (핵심)
- [ ] `frontend/src/pages/Upload.tsx`
- [ ] 파일 드래그앤드랍 업로드
- [ ] Excel/CSV 템플릿 다운로드 버튼
- [ ] 데이터 미리보기 테이블
- [ ] 유효성 검사 결과 표시
- [ ] 업로드 옵션 선택 (추가/업데이트/전체교체)
- [ ] 프로그레스 바 실시간 업데이트
- [ ] 결과 보고서 (성공/실패 건수)

### 공통 컴포넌트
- [ ] `frontend/src/components/common/Header.tsx`
- [ ] `frontend/src/components/common/Sidebar.tsx`
- [ ] `frontend/src/components/common/LoadingSpinner.tsx`
- [ ] `frontend/src/components/common/Modal.tsx`
- [ ] `frontend/src/components/common/Button.tsx`
- [ ] `frontend/src/components/common/Table.tsx`

### 상태 관리
- [ ] Zustand 스토어 설정
- [ ] 재료 상태 관리
- [ ] 시술 상태 관리
- [ ] 업로드 상태 관리
- [ ] 대시보드 상태 관리

---

## 🔄 **Phase 4: 고급 기능** (4주차)

### 업로드 히스토리 & 롤백
- [ ] `GET /api/upload/history` - 업로드 이력 조회
- [ ] `POST /api/upload/rollback/:id` - 업로드 롤백
- [ ] 업로드 히스토리 페이지
- [ ] 롤백 확인 모달

### 데이터 내보내기
- [ ] `GET /api/export/materials` - 재료 Excel 다운로드
- [ ] `GET /api/export/procedures` - 시술 Excel 다운로드
- [ ] `POST /api/export/filtered` - 필터링된 데이터 다운로드
- [ ] `GET /api/upload/template/:type` - 업로드 템플릿 다운로드

### 고급 UI/UX
- [ ] 토스트 알림 시스템
- [ ] 스켈레톤 로딩 UI
- [ ] 에러 바운더리 구현
- [ ] 반응형 디자인 최적화
- [ ] 다크모드 지원 (선택사항)

### 성능 최적화
- [ ] React.memo로 컴포넌트 최적화
- [ ] 가상화(Virtualization) 대용량 테이블
- [ ] API 응답 캐싱
- [ ] 이미지 레이지 로딩

---

## 🧪 **Phase 5: 테스트 & 배포** (마무리)

### 테스트
- [ ] 백엔드 API 단위 테스트 (Jest)
- [ ] 프론트엔드 컴포넌트 테스트
- [ ] E2E 테스트 (핵심 플로우)
- [ ] 대용량 업로드 성능 테스트
- [ ] 크로스 브라우저 테스트

### 배포 준비
- [ ] 환경변수 설정 문서화
- [ ] Docker 설정 (선택사항)
- [ ] Vercel/Netlify 배포 설정
- [ ] Supabase 운영 DB 마이그레이션

### 문서화
- [ ] API 문서 작성
- [ ] 사용자 매뉴얼 작성
- [ ] 개발자 가이드 업데이트
- [ ] 배포 가이드 작성

---

## 🎯 **우선순위별 핵심 기능**

### 🔥 **Must Have (필수)**
1. ✅ Supabase 연결 & 기본 CRUD
2. 🔄 **대량 업로드 시스템** (Excel/CSV → DB)
3. 📊 마진/마진율 자동 계산
4. 📈 대시보드 (KPI + TOP 5 차트)

### 🌟 **Should Have (권장)**
1. 📋 업로드 히스토리 & 롤백
2. 📤 데이터 내보내기 & 템플릿
3. 🔍 고급 검색/필터링
4. 📱 반응형 UI

### 💡 **Could Have (선택)**
1. 📊 고급 차트/그래프
2. 🔔 알림 시스템
3. 👤 사용자 권한 관리
4. 📱 모바일 앱

---

## 📁 **생성해야 할 주요 파일들**

### 백엔드
```
backend/
├── src/
│   ├── index.ts                 # Express 서버
│   ├── controllers/
│   │   ├── materialController.ts
│   │   ├── procedureController.ts
│   │   └── uploadController.ts  # 핵심
│   ├── services/
│   │   ├── uploadService.ts     # 핵심
│   │   ├── validationService.ts
│   │   └── calculationService.ts
│   ├── utils/
│   │   ├── fileProcessor.ts
│   │   ├── excelHandler.ts
│   │   └── csvHandler.ts
│   └── jobs/
│       └── uploadProcessor.ts   # Bull 작업
├── prisma/
│   └── schema.prisma
└── tsconfig.json
```

### 프론트엔드
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Procedures.tsx
│   │   ├── Materials.tsx
│   │   └── Upload.tsx           # 핵심
│   ├── components/
│   │   ├── dashboard/
│   │   ├── upload/              # 핵심
│   │   └── common/
│   ├── hooks/
│   │   ├── useFileUpload.ts     # 핵심
│   │   └── useUploadProgress.ts
│   ├── store/
│   │   └── index.ts            # Zustand
│   ├── services/
│   │   └── api.ts              # API 호출
│   └── utils/
│       ├── fileValidation.ts
│       └── formatters.ts
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔥 **즉시 시작할 작업 (Week 1)**
1. `backend/src/index.ts` Express 서버 생성
2. `backend/prisma/schema.prisma` DB 스키마 작성
3. `frontend/src/App.tsx` 기본 React 앱 구조
4. Supabase 연결 테스트
5. 기본 CRUD API 1개 (Materials) 완성

---

*이 TODO를 단계별로 진행하면 4주 내에 완전한 원가관리 시스템을 완성할 수 있습니다.*