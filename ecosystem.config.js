module.exports = {
  apps: [
    {
      name: 'dd-beautiful-management',
      script: './backend/dist/index.js',
      cwd: './',
      instances: 1, // 또는 'max'로 설정하여 CPU 코어 수만큼 실행
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // 로그 설정
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 재시작 설정
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // 모니터링
      monitoring: false,
      
      // 자동 재시작 설정
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // 시작 지연
      wait_ready: true,
      listen_timeout: 3000,
      
      // 프로세스 종료 설정
      kill_timeout: 5000,
      
      // 환경별 설정
      source_map_support: true,
      
      // 사용자 정의 환경 변수
      env_vars: {
        'COMMON_VARIABLE': 'true'
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/kimmokhwa/beautiful-management-app.git',
      path: '/var/www/dd-beautiful-management',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/dd-beautiful-management/logs'
    }
  }
};
