import { supabase } from '../lib/supabase';

export interface Material {
  id: number;
  name: string;
  price: number;
  unit: string;
  usage_count: number;
  sales_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Procedure {
  id: number;
  category: string;
  name: string;
  price: number;
  cost: number;
  margin: number;
  margin_rate: number;
  materials: ProcedureMaterial[];
  sales_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProcedureMaterial {
  id: number;
  procedure_id: number;
  material_id: number;
  quantity: number;
  created_at?: string;
}

// Materials API
export const materialsApi = {
  getAll: async (): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  create: async (material: { name: string; price: number; unit: string }): Promise<Material> => {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, material: { name?: string; price?: number; unit?: string }): Promise<Material> => {
    const { data, error } = await supabase
      .from('materials')
      .update(material)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Procedures API
export const proceduresApi = {
  getAll: async (): Promise<Procedure[]> => {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  create: async (procedure: { 
    category: string; 
    name: string; 
    price: number; 
    cost: number; 
    margin?: number; 
    margin_rate?: number; 
  }): Promise<Procedure> => {
    const { data, error } = await supabase
      .from('procedures')
      .insert([procedure])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, procedure: { 
    category?: string; 
    name?: string; 
    price?: number; 
    cost?: number; 
    margin?: number; 
    margin_rate?: number; 
  }): Promise<Procedure> => {
    const { data, error } = await supabase
      .from('procedures')
      .update(procedure)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('procedures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Procedure Materials API
export const procedureMaterialsApi = {
  getByProcedureId: async (procedureId: number): Promise<ProcedureMaterial[]> => {
    const { data, error } = await supabase
      .from('procedure_materials')
      .select('*')
      .eq('procedure_id', procedureId);
    
    if (error) throw error;
    return data;
  },

  create: async (procedureMaterial: Omit<ProcedureMaterial, 'id'>): Promise<ProcedureMaterial> => {
    const { data, error } = await supabase
      .from('procedure_materials')
      .insert([procedureMaterial])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('procedure_materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 시술에 사용되는 재료 일괄 업데이트
  updateProcedureMaterials: async (
    procedureId: number, 
    materialNames: string[]
  ): Promise<void> => {
    // 1. 기존 재료 삭제
    const { error: deleteError } = await supabase
      .from('procedure_materials')
      .delete()
      .eq('procedure_id', procedureId);
    
    if (deleteError) throw deleteError;

    // 2. 새로운 재료 추가
    if (materialNames.length > 0) {
      const newMaterials = materialNames.map(name => ({
        procedure_id: procedureId,
        material_name: name
      }));

      const { error: insertError } = await supabase
        .from('procedure_materials')
        .insert(newMaterials);

      if (insertError) throw insertError;
    }
  }
}; 

// Goal Procedures API
export const goalProceduresApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('goal_procedures')
      .select('*'); // select 파라미터 명확히 지정, on_conflict 등 불필요한 파라미터 제거
    if (error) throw error;
    return data;
  },
  upsert: async (goalList: { procedure_id: number, goal_count: number }[]) => {
    // 여러 개를 한 번에 upsert
    const { data, error } = await supabase
      .from('goal_procedures')
      .upsert(goalList, { onConflict: 'procedure_id' })
      .select();
    if (error) throw error;
    return data;
  },
  delete: async (id: number) => {
    const { error } = await supabase
      .from('goal_procedures')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}; 