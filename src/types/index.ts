export interface Material {
  id: number;
  name: string;
  cost: number;
  usage_count?: number;
  sales_count?: number; // 판매량(사용량) 필드 추가
  sale_count?: number;  // 호환성 위해 추가
  created_at?: string;
  updated_at?: string;
}

export interface Procedure {
  id: number;
  category: string;
  name: string;
  customer_price: number;
  materials?: string[]; // DB에서는 text array로 저장됨
  sales_count?: number; // 판매량 필드 추가
  sale_count?: number;  // 호환성 위해 추가
  created_at?: string;
  updated_at?: string;
}

export interface ProcedureMaterial {
  material_id: number;
  quantity: number;
  procedure_id: number;
}

export interface SystemInfo {
  id: number;
  total_procedures: number;
  total_materials: number;
  last_updated: string;
}

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

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
} 