export interface Material {
  id: number;
  name: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
  id: number;
  category: string;
  name: string;
  customer_price: number;
  cost: number;
  margin: number;
  margin_rate: string | null;
  materials: string[];
  created_at: string;
  updated_at: string;
}

export interface ProcedureMaterial {
  id: number;
  procedure_id: number;
  material_name: string;
  created_at: string;
}

export interface SystemInfo {
  id: number;
  total_procedures: number;
  total_materials: number;
  last_updated: string;
}

// UI 상태 관리를 위한 타입
export interface FilterState {
  category: string;
  searchTerm: string;
  sortBy: 'name' | 'cost' | 'margin_rate';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
} 