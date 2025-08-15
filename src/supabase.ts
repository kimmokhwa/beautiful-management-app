import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Material {
  id: number;
  name: string;
  price: number;
  unit: string;
}

interface Procedure {
  id: number;
  category: string;
  name: string;
  customer_price: number;
  materials: string[];
}

// 재료 관련 함수들
export const getMaterials = async () => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Material[];
};

export const addMaterial = async (material: Omit<Material, 'id'>) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([material])
    .select();
  
  if (error) throw error;
  return data[0] as Material;
};

export const updateMaterial = async (id: number, updates: Partial<Omit<Material, 'id'>>) => {
  const { data, error } = await supabase
    .from('materials')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0] as Material;
};

export const deleteMaterial = async (id: number) => {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// 시술 관련 함수들
export const getProcedures = async () => {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Procedure[];
};

export const addProcedure = async (procedure: Omit<Procedure, 'id'>) => {
  const { data, error } = await supabase
    .from('procedures')
    .insert([procedure])
    .select();
  
  if (error) throw error;
  return data[0] as Procedure;
};

export const updateProcedure = async (id: number, updates: Partial<Omit<Procedure, 'id'>>) => {
  const { data, error } = await supabase
    .from('procedures')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0] as Procedure;
};

export const deleteProcedure = async (id: number) => {
  const { error } = await supabase
    .from('procedures')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// 시스템 정보 관련 함수
export const getSystemInfo = async () => {
  const [procedures, materials] = await Promise.all([
    getProcedures(),
    getMaterials(),
  ]);

  const marginRates = procedures.map(p => {
    const totalCost = p.materials.reduce((acc: number, m: string) => acc + parseFloat(m.split(' ')[1]), 0);
    return ((p.customer_price - totalCost) / p.customer_price) * 100;
  });

  return {
    total_procedures: procedures.length,
    total_materials: materials.length,
    average_margin_rate: marginRates.reduce((a, b) => a + b, 0) / marginRates.length,
    highest_margin_rate: Math.max(...marginRates),
  };
}; 