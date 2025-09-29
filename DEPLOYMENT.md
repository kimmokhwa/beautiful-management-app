# DD Beautiful Management System - 배포 가이드

## 🚀 배포 준비사항

### 1. 환경 변수 설정

#### 백엔드 환경 변수 (`backend/.env`)
```bash
# 데이터베이스 설정
DATABASE_URL="file:./dev.db"

# Supabase 설정 (필수)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# 서버 설정
PORT=3001
NODE_ENV=production

# CORS 설정 (프로덕션 도메인으로 변경)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 파일 업로드 설정
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### 프론트엔드 환경 변수 (`frontend/.env`)
```bash
# API 서버 설정 (프로덕션 URL로 변경)
VITE_API_BASE_URL=https://yourdomain.com/api

# Supabase 설정
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 애플리케이션 설정
VITE_APP_TITLE=DD Beautiful Management System
VITE_APP_VERSION=1.0.0
```

## 📦 배포 방법

### 방법 1: 일반 서버 배포

#### 1단계: 의존성 설치 및 빌드
```bash
# 전체 프로젝트 빌드
npm run build

# 또는 개별적으로
npm run install:deps
npm run build:frontend
npm run build:backend
```

#### 2단계: 프로덕션 서버 실행
```bash
# 프로덕션 모드로 실행
npm run start:prod

# 또는 PM2를 사용한 프로세스 관리
npm install -g pm2
pm2 start ecosystem.config.js
```

### 방법 2: Docker 배포 (권장)

#### 1단계: Docker 이미지 빌드
```bash
# Docker 이미지 빌드
docker build -t dd-beautiful-management .

# 또는 docker-compose 사용
docker-compose build
```

#### 2단계: 컨테이너 실행
```bash
# Docker Compose로 실행 (권장)
docker-compose up -d

# 또는 직접 Docker 실행
docker run -d \
  --name dd-beautiful-management \
  -p 3001:3001 \
  --env-file backend/.env \
  -v $(pwd)/backend/uploads:/app/backend/uploads \
  dd-beautiful-management
```

#### 3단계: 헬스 체크
```bash
# 애플리케이션 상태 확인
curl http://localhost:3001/health

# Supabase 연결 확인
curl http://localhost:3001/api/test-connection
```

### 방법 3: 클라우드 플랫폼 배포

#### Vercel 배포 (프론트엔드)
```bash
# Vercel CLI 설치
npm install -g vercel

# 프론트엔드 디렉토리에서
cd frontend
vercel --prod
```

#### Railway 배포 (백엔드)
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 프로젝트 연결 및 배포
railway login
railway init
railway up
```

#### Heroku 배포
```bash
# Heroku CLI 설치 후
heroku create dd-beautiful-management
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
git push heroku main
```

## 🔧 환경별 설정

### 개발 환경
```bash
npm run dev
```

### 스테이징 환경
```bash
NODE_ENV=staging npm run start:prod
```

### 프로덕션 환경
```bash
NODE_ENV=production npm run start:prod
```

## 📊 모니터링 및 로그

### 애플리케이션 모니터링
- Health Check: `http://your-domain.com/health`
- Supabase 연결 테스트: `http://your-domain.com/api/test-connection`

### 로그 확인
```bash
# Docker Compose 로그
docker-compose logs -f app

# PM2 로그
pm2 logs

# 일반 실행 로그
npm run start:prod 2>&1 | tee app.log
```

## 🛡️ 보안 고려사항

### 1. 환경 변수 보안
- `.env` 파일을 절대 Git에 커밋하지 마세요
- 프로덕션에서는 환경 변수를 안전하게 관리하세요
- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하세요

### 2. CORS 설정
```typescript
// 프로덕션에서는 정확한 도메인만 허용
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. HTTPS 설정
- 프로덕션에서는 반드시 HTTPS를 사용하세요
- SSL 인증서를 설정하세요

## 🔄 CI/CD 파이프라인

### GitHub Actions 예시
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run build
      - run: npm test
      - name: Deploy to server
        # 배포 스크립트 실행
```

## 🐛 트러블슈팅

### 자주 발생하는 문제들

#### 1. CORS 오류
```bash
# 해결: CORS_ORIGINS 환경 변수 확인
echo $CORS_ORIGINS
```

#### 2. Supabase 연결 오류
```bash
# 해결: 환경 변수 확인
curl http://localhost:3001/api/test-connection
```

#### 3. 파일 업로드 오류
```bash
# 해결: uploads 디렉토리 권한 확인
chmod 755 backend/uploads
```

#### 4. 메모리 부족
```bash
# Node.js 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## 📈 성능 최적화

### 1. 프론트엔드 최적화
- 코드 스플리팅
- 이미지 최적화
- CDN 사용

### 2. 백엔드 최적화
- Redis 캐싱 (옵션)
- 데이터베이스 인덱싱
- API 응답 압축

### 3. 서버 최적화
- PM2 클러스터 모드
- 로드 밸런싱
- 자동 스케일링

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. Supabase 연결 상태
3. 애플리케이션 로그
4. 네트워크 연결

배포 관련 추가 지원이 필요하면 개발팀에 문의하세요.
