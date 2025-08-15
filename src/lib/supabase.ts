import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 설정
const supabaseUrl = 'https://srzxkqbzjfuuunglnmzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyenhrcWJ6amZ1dXVuZ2xubXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDQ3MDEsImV4cCI6MjA3MDgyMDcwMX0.qOE0Phwbk2qEwaSY1YI_rOv0RnajVXeEGx-dqOXrYFg';

// Supabase 클라이언트 초기화
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 재료 관련 API
export const materialsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('재료 목록 조회 오류:', error);
      throw error;
    }
    
    return data || [];
  },

  async create(material: { name: string; price: number; unit: string }) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    
    if (error) {
      console.error('재료 생성 오류:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: number, updates: { name?: string; price?: number; unit?: string }) {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('재료 수정 오류:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('재료 삭제 오류:', error);
      throw error;
    }
  }
};

// 시술 관련 API
export const proceduresApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('procedures')
      .select(`
        *,
        procedure_materials (
          material_id,
          quantity
        )
      `)
      .order('name');
    
    if (error) {
      console.error('시술 목록 조회 오류:', error);
      throw error;
    }
    
    return data || [];
  },

  async create(procedure: {
    category: string;
    name: string;
    price: number;
    cost: number;
    materials: { material_id: number; quantity: number }[];
  }) {
    const { data: procedureData, error: procedureError } = await supabase
      .from('procedures')
      .insert([{
        category: procedure.category,
        name: procedure.name,
        price: procedure.price,
        cost: procedure.cost
      }])
      .select()
      .single();

    if (procedureError) {
      console.error('시술 생성 오류:', procedureError);
      throw procedureError;
    }

    if (procedure.materials.length > 0) {
      const procedureMaterials = procedure.materials.map(m => ({
        procedure_id: procedureData.id,
        ...m
      }));

      const { error: materialsError } = await supabase
        .from('procedure_materials')
        .insert(procedureMaterials);

      if (materialsError) {
        console.error('시술 재료 연결 오류:', materialsError);
        throw materialsError;
      }
    }

    return procedureData;
  },

  async update(id: number, updates: {
    category?: string;
    name?: string;
    price?: number;
    cost?: number;
    materials?: { material_id: number; quantity: number }[];
  }) {
    const { data: procedureData, error: procedureError } = await supabase
      .from('procedures')
      .update({
        category: updates.category,
        name: updates.name,
        price: updates.price,
        cost: updates.cost
      })
      .eq('id', id)
      .select()
      .single();

    if (procedureError) {
      console.error('시술 수정 오류:', procedureError);
      throw procedureError;
    }

    if (updates.materials) {
      const { error: deleteError } = await supabase
        .from('procedure_materials')
        .delete()
        .eq('procedure_id', id);

      if (deleteError) {
        console.error('시술 재료 삭제 오류:', deleteError);
        throw deleteError;
      }

      if (updates.materials.length > 0) {
        const procedureMaterials = updates.materials.map(m => ({
          procedure_id: id,
          ...m
        }));

        const { error: materialsError } = await supabase
          .from('procedure_materials')
          .insert(procedureMaterials);

        if (materialsError) {
          console.error('시술 재료 연결 오류:', materialsError);
          throw materialsError;
        }
      }
    }

    return procedureData;
  },

  async delete(id: number) {
    const { error: materialsError } = await supabase
      .from('procedure_materials')
      .delete()
      .eq('procedure_id', id);

    if (materialsError) {
      console.error('시술 재료 삭제 오류:', materialsError);
      throw materialsError;
    }

    const { error } = await supabase
      .from('procedures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('시술 삭제 오류:', error);
      throw error;
    }
  }
}; 

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