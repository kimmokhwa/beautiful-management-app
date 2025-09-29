import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';
import { config, validateConfig } from './config';

// 환경변수 유효성 검사
validateConfig();

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey);

// 재료 관련 함수
export const getMaterials = async () => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const addMaterial = async (name: string, cost: number) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([{ name, cost }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateMaterial = async (id: number, updates: { name?: string; cost?: number }) => {
  const { data, error } = await supabase
    .from('materials')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteMaterial = async (id: number) => {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// 시술 관련 함수
export const getProcedures = async () => {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
};

export const addProcedure = async (procedure: {
  category: string;
  name: string;
  customer_price: number;
  materials?: string[];
}) => {
  const { data, error } = await supabase
    .from('procedures')
    .insert([procedure])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateProcedure = async (
  id: number,
  updates: {
    category?: string;
    name?: string;
    customer_price?: number;
    materials?: string[];
  }
) => {
  const { data, error } = await supabase
    .from('procedures')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
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
  const { data, error } = await supabase
    .from('system_info')
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateSystemInfo = async (updates: {
  total_procedures?: number;
  total_materials?: number;
}) => {
  const { data, error } = await supabase
    .from('system_info')
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq('id', 1)
    .select();
  if (error) throw error;
  return data[0];
};

// 대량 업로드 함수
export const bulkUpload = async (type: 'materials' | 'procedures', file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvData = e.target?.result;
        if (typeof csvData !== 'string') {
          throw new Error('CSV 데이터를 읽을 수 없습니다.');
        }

        const { data, error } = await supabase.functions.invoke('bulk-upload', {
          body: { type, data: csvData }
        });

        if (error) throw error;
        return resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsText(file);
  });
}; 