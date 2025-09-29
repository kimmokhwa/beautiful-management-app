import { Request, Response } from 'express';
import { supabase } from '../index';

// Mock 재료 데이터
const mockMaterials = [
  {
    id: 1,
    name: '히알루론산 필러 1ml',
    cost: 180000,
    description: '프리미엄 히알루론산 필러',
    supplier: 'A사',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '보툴리눔 톡신 100U',
    cost: 120000,
    description: '미국산 보톡스',
    supplier: 'B사',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '레이저 토닝 카트리지',
    cost: 50000,
    description: '레이저 치료용 소모품',
    supplier: 'C사',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// GET /api/materials - 모든 재료 조회
export const getMaterials = async (req: Request, res: Response) => {
  try {
    // Supabase에서 재료 조회 시도
    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    if (!error && materials) {
      res.json({
        success: true,
        data: materials,
        count: materials.length,
        message: '재료 목록 조회 성공 (Supabase 연동)'
      });
    } else {
      console.error('Supabase materials error:', error);
      // Supabase 실패 시 Mock 데이터 사용
      res.json({
        success: true,
        data: mockMaterials,
        count: mockMaterials.length,
        message: '재료 목록 조회 성공 (Mock 데이터)'
      });
    }
  } catch (error) {
    console.error('Get materials error:', error);

    // 오류 시에도 Mock 데이터 반환
    res.json({
      success: true,
      data: mockMaterials,
      count: mockMaterials.length,
      message: '재료 목록 조회 성공 (Mock 데이터 - 오류 복구)'
    });
  }
};

// GET /api/materials/:id - 특정 재료 조회
export const getMaterial = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Supabase에서 재료 조회 시도
    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && material) {
      res.json({
        success: true,
        data: material,
        message: '재료 조회 성공 (Supabase 연동)'
      });
    } else {
      // Supabase 실패 시 Mock 데이터에서 찾기
      const mockMaterial = mockMaterials.find(m => m.id === id);

      if (!mockMaterial) {
        return res.status(404).json({
          success: false,
          message: '재료를 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: mockMaterial,
        message: '재료 조회 성공 (Mock 데이터)'
      });
    }
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: '재료를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/materials - 새 재료 생성
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { name, cost, description, supplier } = req.body;

    // 유효성 검사
    if (!name || !cost) {
      return res.status(400).json({
        success: false,
        message: '재료명과 원가는 필수입니다.'
      });
    }

    // Supabase에 재료 생성 시도
    const { data: newMaterial, error } = await supabase
      .from('materials')
      .insert([{
        name,
        cost: parseFloat(cost),
        description: description || '',
        supplier: supplier || ''
      }])
      .select()
      .single();

    if (!error && newMaterial) {
      res.status(201).json({
        success: true,
        data: newMaterial,
        message: '재료가 성공적으로 생성되었습니다. (Supabase 연동)'
      });
    } else {
      // Supabase 실패 시 Mock 응답
      const mockNewMaterial = {
        id: mockMaterials.length + 1,
        name,
        cost: parseFloat(cost),
        description: description || '',
        supplier: supplier || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockMaterials.push(mockNewMaterial);

      res.status(201).json({
        success: true,
        data: mockNewMaterial,
        message: '재료가 성공적으로 생성되었습니다. (Mock 데이터)'
      });
    }
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      success: false,
      message: '재료 생성에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT /api/materials/:id - 재료 수정
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, cost, description, supplier } = req.body;

    // Supabase에서 재료 수정 시도
    const { data: updatedMaterial, error } = await supabase
      .from('materials')
      .update({
        name: name,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        description: description,
        supplier: supplier,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && updatedMaterial) {
      res.json({
        success: true,
        data: updatedMaterial,
        message: '재료가 성공적으로 수정되었습니다. (Supabase 연동)'
      });
    } else {
      // Supabase 실패 시 Mock 데이터 수정
      const materialIndex = mockMaterials.findIndex(m => m.id === id);

      if (materialIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '재료를 찾을 수 없습니다.'
        });
      }

      mockMaterials[materialIndex] = {
        ...mockMaterials[materialIndex],
        name: name || mockMaterials[materialIndex].name,
        cost: cost !== undefined ? parseFloat(cost) : mockMaterials[materialIndex].cost,
        description: description !== undefined ? description : mockMaterials[materialIndex].description,
        supplier: supplier !== undefined ? supplier : mockMaterials[materialIndex].supplier,
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        data: mockMaterials[materialIndex],
        message: '재료가 성공적으로 수정되었습니다. (Mock 데이터)'
      });
    }
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: '재료 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// DELETE /api/materials/:id - 재료 삭제
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // 먼저 재료가 존재하는지 확인
    const { data: material } = await supabase
      .from('materials')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '재료를 찾을 수 없습니다.'
      });
    }

    // 이 재료를 사용하는 시술이 있는지 확인
    const { data: usedInProcedures } = await supabase
      .from('procedure_materials')
      .select('procedure_id')
      .eq('material_id', id);

    if (usedInProcedures && usedInProcedures.length > 0) {
      return res.status(400).json({
        success: false,
        message: `이 재료는 ${usedInProcedures.length}개의 시술에서 사용 중이므로 삭제할 수 없습니다. 먼저 관련 시술에서 이 재료를 제거해주세요.`,
        usedInProcedures: usedInProcedures.length
      });
    }

    // 안전하게 재료 삭제
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (!error) {
      res.json({
        success: true,
        message: '재료가 성공적으로 삭제되었습니다.'
      });
    } else {
      console.error('Supabase delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: '재료 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};