import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://egbvvxmnvxqkewuyjzbt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYnZ2eG1udnhxa2V3dXlqemJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTczNjIsImV4cCI6MjA2OTQzMzM2Mn0.59PP9ULhY3PHqLEB_F_fcXR0MIwCxYp6dg4wOziiaQ8';

// Supabase 클라이언트 초기화
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Note: materialsApi는 src/services/api.ts에서 정의됨

// Note: proceduresApi는 src/services/api.ts에서 정의됨 

// Goal Procedures API
export const goalProceduresApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('goal_procedures')
      .select('*');
    if (error) {
      console.error('목표 시술 목록 조회 오류:', error);
      throw error;
    }
    return data || [];
  },
  
  async upsert(goalList: { procedure_id: number, goal_count: number }[]) {
    const { data, error } = await supabase
      .from('goal_procedures')
      .upsert(goalList, { onConflict: 'procedure_id' })
      .select();
    if (error) {
      console.error('목표 시술 저장 오류:', error);
      throw error;
    }
    return data;
  },
  
  async delete(id: number) {
    const { error } = await supabase
      .from('goal_procedures')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('목표 시술 삭제 오류:', error);
      throw error;
    }
  }
}; 