import { supabase } from '../lib/supabase';

export interface Material {
  id: number;
  name: string;
  cost: number;
  usage_count?: number;
  sales_count?: number;
  sale_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Procedure {
  id: number;
  category: string;
  name: string;
  customer_price: number;
  materials?: string[];
  // 계산용 선택 필드 (클라이언트에서 계산)
  cost?: number;
  margin?: number;
  margin_rate?: number;
  sales_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProcedureMaterial {
  id: number;
  procedure_id: number;
  material_name: string;
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
    
    // 데이터에 기본값 설정
    return (data || []).map(material => ({
      ...material,
      usage_count: material.usage_count || 0,
      sales_count: material.sales_count || 0,
      sale_count: material.sale_count || 0
    }));
  },

  create: async (material: Omit<Material, 'id'>): Promise<Material> => {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, material: Partial<Material>): Promise<Material> => {
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
    
    // 데이터에 기본값 설정
    return (data || []).map(procedure => ({
      ...procedure,
      materials: procedure.materials || [],
      sales_count: procedure.sales_count || 0
    }));
  },

  create: async (procedure: Omit<Procedure, 'id'>): Promise<Procedure> => {
    // DB 컬럼만 전송하도록 정리
    const payload = {
      category: procedure.category,
      name: procedure.name,
      customer_price: procedure.customer_price,
      materials: procedure.materials || [],
    };

    const { data, error } = await supabase
      .from('procedures')
      .insert([payload])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, procedure: Partial<Procedure>): Promise<Procedure> => {
    // 허용된 컬럼만 선택적으로 업데이트
    const payload: any = {};
    if (procedure.category !== undefined) payload.category = procedure.category;
    if (procedure.name !== undefined) payload.name = procedure.name;
    if (procedure.customer_price !== undefined) payload.customer_price = procedure.customer_price;
    if (procedure.materials !== undefined) payload.materials = procedure.materials;
    // sales_count 컬럼은 DB에 없으므로 전송하지 않음

    const { data, error } = await supabase
      .from('procedures')
      .update(payload)
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

// Procedure Materials API - 비활성화 (procedure_materials 테이블이 존재하지 않음)
// procedures 테이블의 materials 컬럼(ARRAY 타입)을 직접 사용
export const procedureMaterialsApi = {
  // 더미 API - 실제 사용하지 않음
  getByProcedureId: async (procedureId: number): Promise<ProcedureMaterial[]> => {
    return [];
  },

  create: async (procedureMaterial: Omit<ProcedureMaterial, 'id'>): Promise<ProcedureMaterial> => {
    throw new Error('procedure_materials 테이블이 존재하지 않습니다.');
  },

  delete: async (id: number): Promise<void> => {
    throw new Error('procedure_materials 테이블이 존재하지 않습니다.');
  },

  updateProcedureMaterials: async (
    procedureId: number, 
    materialNames: string[]
  ): Promise<void> => {
    // procedures 테이블의 materials 컬럼을 직접 업데이트
    const { error } = await supabase
      .from('procedures')
      .update({ materials: materialNames })
      .eq('id', procedureId);
    
    if (error) throw error;
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