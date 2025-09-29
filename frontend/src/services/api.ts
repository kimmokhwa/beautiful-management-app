// API 서비스 레이어
export const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // 재료 관리 API
  materials = {
    // 모든 재료 조회
    getAll: (params?: { search?: string; sortBy?: string; sortOrder?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString();
      return this.request<ApiResponse<Material[]>>(`/materials${queryString ? `?${queryString}` : ''}`);
    },

    // 특정 재료 조회
    getById: (id: number) => {
      return this.request<ApiResponse<Material>>(`/materials/${id}`);
    },

    // 재료 생성
    create: (data: CreateMaterialData) => {
      return this.request<ApiResponse<Material>>('/materials', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // 재료 수정
    update: (id: number, data: UpdateMaterialData) => {
      return this.request<ApiResponse<Material>>(`/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // 재료 삭제
    delete: (id: number) => {
      return this.request<ApiResponse<void>>(`/materials/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // 시술 관리 API
  procedures = {
    // 모든 시술 조회
    getAll: (params?: { search?: string; category?: string; sortBy?: string; sortOrder?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString();
      return this.request<ApiResponse<ProcedureWithMargin[]>>(`/procedures${queryString ? `?${queryString}` : ''}`);
    },

    // 특정 시술 조회
    getById: (id: number) => {
      return this.request<ApiResponse<ProcedureWithMargin>>(`/procedures/${id}`);
    },

    // 시술 생성
    create: (data: CreateProcedureData) => {
      return this.request<ApiResponse<Procedure>>('/procedures', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // 시술 수정
    update: (id: number, data: UpdateProcedureData) => {
      return this.request<ApiResponse<Procedure>>(`/procedures/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // 시술 삭제
    delete: (id: number) => {
      return this.request<ApiResponse<void>>(`/procedures/${id}`, {
        method: 'DELETE',
      });
    },

    // 추천 시술 토글
    toggleRecommendation: (id: number) => {
      return this.request<ApiResponse<Procedure>>(`/procedures/${id}/recommend`, {
        method: 'PUT',
      });
    },
  };

  // 대시보드 API
  dashboard = {
    // 전체 통계
    getStats: () => {
      return this.request<ApiResponse<DashboardStats>>('/dashboard/stats');
    },

    // 마진 TOP 5
    getTopMargin: () => {
      return this.request<ApiResponse<ProcedureWithMargin[]>>('/dashboard/top-margin');
    },

    // 마진율 TOP 5
    getTopMarginRate: () => {
      return this.request<ApiResponse<ProcedureWithMargin[]>>('/dashboard/top-margin-rate');
    },

    // 추천 시술 목록
    getRecommended: () => {
      return this.request<ApiResponse<ProcedureWithMargin[]>>('/dashboard/recommended');
    },

    // 카테고리별 통계
    getCategoryStats: () => {
      return this.request<ApiResponse<CategoryStats[]>>('/dashboard/categories');
    },
  };

  // 업로드 API
  upload = {
    // 재료 업로드
    materials: (file: File, mode: 'add' | 'update' | 'replace' = 'add') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      return this.request<ApiResponse<UploadResult>>('/upload/materials', {
        method: 'POST',
        body: formData,
        headers: {}, // FormData는 Content-Type을 자동으로 설정하므로 제거
      });
    },

    // 시술 업로드
    procedures: (file: File, mode: 'add' | 'update' | 'replace' = 'add') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      return this.request<ApiResponse<UploadResult>>('/upload/procedures', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },

    // 업로드 히스토리
    getHistory: (type?: 'materials' | 'procedures', limit?: number) => {
      const searchParams = new URLSearchParams();
      if (type) searchParams.append('type', type);
      if (limit) searchParams.append('limit', limit.toString());

      const queryString = searchParams.toString();
      return this.request<ApiResponse<UploadJob[]>>(`/upload/history${queryString ? `?${queryString}` : ''}`);
    },

    // 템플릿 다운로드
    downloadTemplate: (type: 'materials' | 'procedures') => {
      window.open(`${API_BASE_URL}/upload/templates/${type}`, '_blank');
    },
  };
}

// 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface Material {
  id: number;
  name: string;
  cost: number;
  description?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialData {
  name: string;
  cost: number;
  description?: string;
  supplier?: string;
}

export interface UpdateMaterialData {
  name?: string;
  cost?: number;
  description?: string;
  supplier?: string;
}

export interface Procedure {
  id: number;
  name: string;
  categoryId?: number;
  customerPrice: number;
  isRecommended: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureWithMargin extends Procedure {
  category: string;
  totalCost: number;
  margin: number;
  marginRate: number;
  materials: {
    id?: number;
    materialId: number;
    name: string;
    cost: number;
    quantity: number;
  }[];
}

export interface CreateProcedureData {
  name: string;
  categoryId?: number;
  customerPrice: number;
  materials?: { materialId: number; quantity: number }[];
  isRecommended?: boolean;
  notes?: string;
}

export interface UpdateProcedureData {
  name?: string;
  categoryId?: number;
  customerPrice?: number;
  materials?: { materialId: number; quantity: number }[];
  isRecommended?: boolean;
  notes?: string;
}

export interface DashboardStats {
  totalProcedures: number;
  avgMarginRate: number;
  maxMargin: number;
  recommendedCount: number;
  avgPrice: number;
  totalMaterials: number;
}

export interface CategoryStats {
  name: string;
  procedureCount: number;
  avgMarginRate: number;
  totalMargin: number;
}

export interface UploadResult {
  jobId: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: { row: number; message: string }[];
}

export interface UploadJob {
  id: string;
  type: 'materials' | 'procedures';
  fileName: string;
  fileSize?: number;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rollback';
  progressPercentage: number;
  errorDetails?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// API 서비스 인스턴스 생성
const api = new ApiService();

export default api;