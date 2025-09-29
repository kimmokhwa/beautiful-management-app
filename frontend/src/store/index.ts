import { create } from 'zustand';

// Types
export interface Material {
  id: number;
  name: string;
  cost: number;
  description?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProcedureMaterial {
  id: number;
  materialId: number;
  quantity: number;
  material: Material;
}

export interface Procedure {
  id: number;
  name: string;
  categoryId?: number;
  customerPrice: number;
  isRecommended: boolean;
  notes?: string;
  category?: Category;
  procedureMaterials: ProcedureMaterial[];
  totalCost?: number;
  margin?: number;
  marginRate?: number;
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
  createdAt: string;
}

export interface DashboardStats {
  totalProcedures: number;
  avgMarginRate: number;
  maxMargin: number;
  recommendedCount: number;
  avgPrice: number;
}

export interface TopMarginItem {
  id: number;
  name: string;
  margin: number;
  marginRate: number;
}

// Material Store
interface MaterialState {
  materials: Material[];
  loading: boolean;
  error: string | null;
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  loading: false,
  error: null,
  setMaterials: (materials) => set({ materials }),
  addMaterial: (material) => set((state) => ({
    materials: [...state.materials, material]
  })),
  updateMaterial: (updatedMaterial) => set((state) => ({
    materials: state.materials.map(material =>
      material.id === updatedMaterial.id ? updatedMaterial : material
    )
  })),
  deleteMaterial: (id) => set((state) => ({
    materials: state.materials.filter(material => material.id !== id)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));

// Procedure Store
interface ProcedureState {
  procedures: Procedure[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  setProcedures: (procedures: Procedure[]) => void;
  setCategories: (categories: Category[]) => void;
  addProcedure: (procedure: Procedure) => void;
  updateProcedure: (procedure: Procedure) => void;
  deleteProcedure: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProcedureStore = create<ProcedureState>((set) => ({
  procedures: [],
  categories: [],
  loading: false,
  error: null,
  setProcedures: (procedures) => set({ procedures }),
  setCategories: (categories) => set({ categories }),
  addProcedure: (procedure) => set((state) => ({
    procedures: [...state.procedures, procedure]
  })),
  updateProcedure: (updatedProcedure) => set((state) => ({
    procedures: state.procedures.map(procedure =>
      procedure.id === updatedProcedure.id ? updatedProcedure : procedure
    )
  })),
  deleteProcedure: (id) => set((state) => ({
    procedures: state.procedures.filter(procedure => procedure.id !== id)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));

// Upload Store
interface UploadState {
  uploadJobs: UploadJob[];
  currentUpload: UploadJob | null;
  loading: boolean;
  error: string | null;
  setUploadJobs: (jobs: UploadJob[]) => void;
  setCurrentUpload: (job: UploadJob | null) => void;
  updateUploadProgress: (jobId: string, progress: Partial<UploadJob>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploadJobs: [],
  currentUpload: null,
  loading: false,
  error: null,
  setUploadJobs: (uploadJobs) => set({ uploadJobs }),
  setCurrentUpload: (currentUpload) => set({ currentUpload }),
  updateUploadProgress: (jobId, progress) => set((state) => ({
    uploadJobs: state.uploadJobs.map(job =>
      job.id === jobId ? { ...job, ...progress } : job
    ),
    currentUpload: state.currentUpload?.id === jobId
      ? { ...state.currentUpload, ...progress }
      : state.currentUpload
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));

// Dashboard Store
interface DashboardState {
  stats: DashboardStats | null;
  topMarginProcedures: TopMarginItem[];
  topMarginRateProcedures: TopMarginItem[];
  loading: boolean;
  error: string | null;
  setStats: (stats: DashboardStats) => void;
  setTopMarginProcedures: (procedures: TopMarginItem[]) => void;
  setTopMarginRateProcedures: (procedures: TopMarginItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  topMarginProcedures: [],
  topMarginRateProcedures: [],
  loading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setTopMarginProcedures: (topMarginProcedures) => set({ topMarginProcedures }),
  setTopMarginRateProcedures: (topMarginRateProcedures) => set({ topMarginRateProcedures }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));