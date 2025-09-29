#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  프로덕션 빌드 테스트 시작...\n');

const steps = [
  {
    name: '의존성 설치',
    command: 'npm run install:deps',
    description: '모든 의존성을 설치합니다.'
  },
  {
    name: '프론트엔드 빌드',
    command: 'npm run build:frontend',
    description: '프론트엔드를 빌드합니다.'
  },
  {
    name: '백엔드 빌드',
    command: 'npm run build:backend',
    description: '백엔드를 빌드합니다.'
  }
];

async function runStep(step) {
  console.log(`📦 ${step.name}...`);
  console.log(`   ${step.description}`);
  
  try {
    execSync(step.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${step.name} 완료\n`);
  } catch (error) {
    console.error(`❌ ${step.name} 실패:`);
    console.error(error.message);
    process.exit(1);
  }
}

async function checkBuildOutputs() {
  console.log('🔍 빌드 결과 확인...');
  
  const expectedFiles = [
    'frontend/dist/index.html',
    'backend/dist/index.js'
  ];
  
  let allExists = true;
  
  for (const file of expectedFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`❌ ${file} - 파일이 생성되지 않았습니다.`);
      allExists = false;
    }
  }
  
  return allExists;
}

async function main() {
  try {
    // 빌드 단계 실행
    for (const step of steps) {
      await runStep(step);
    }
    
    // 빌드 결과 확인
    const buildSuccess = await checkBuildOutputs();
    
    if (buildSuccess) {
      console.log('🎉 프로덕션 빌드 테스트 성공!');
      console.log('\n다음 단계:');
      console.log('1. 환경 변수 설정: backend/.env, frontend/.env');
      console.log('2. 배포 실행: npm run start:prod');
      console.log('3. 또는 Docker 빌드: docker-compose up --build');
    } else {
      console.log('❌ 프로덕션 빌드 테스트 실패!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 빌드 테스트 중 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
