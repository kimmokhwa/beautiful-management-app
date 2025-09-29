// 환경변수 설정
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://egbvvxmnvxqkewuyjzbt.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYnZ2eG1udnhxa2V3dXlqemJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTczNjIsImV4cCI6MjA2OTQzMzM2Mn0.59PP9ULhY3PHqLEB_F_fcXR0MIwCxYp6dg4wOziiaQ8'
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    version: import.meta.env.VITE_APP_VERSION || '0.1.0'
  }
};

// 환경변수 유효성 검사
export const validateConfig = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using default values from config.ts');
  }

  return {
    isValid: true,
    missingVars
  };
};
