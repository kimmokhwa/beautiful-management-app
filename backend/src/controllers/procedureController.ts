import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { supabase } from '../index';

// GET /api/procedures - 모든 시술 조회 (마진 계산 포함)
export const getProcedures = async (req: Request, res: Response) => {
  try {
    const { search, category, sortBy = 'marginRate', sortOrder = 'desc' } = req.query;

    // Supabase에서 시술 조회 시도 (카테고리와 재료 정보 포함)
    console.log('Fetching procedures from Supabase...');
    
    const { data: procedures, error } = await supabase
      .from('procedures')
      .select(`
        *,
        categories(name),
        procedure_materials(
          quantity,
          materials(name, cost)
        )
      `)
      .order('name');

    console.log('Supabase query result:', { procedures, error });

    if (error) {
      console.error('Supabase procedures error:', error);
      // Supabase 실패 시 Mock 데이터 사용
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: `시술 목록 조회 실패: ${error.message}`
      });
    }

    if (!procedures) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: '시술 목록이 없습니다.'
      });
    }

    // 시술 데이터 처리 (실제 카테고리와 재료 기반 총원가 계산)
    const proceduresWithMargin = procedures.map(procedure => {
      const price = Number(procedure.customer_price || 0);
      
      // 카테고리 이름 추출
      const categoryName = procedure.categories?.name || '기타';
      
      // 연결된 재료들의 총원가 계산
      let totalCost = 0;
      const materials = [];
      
      if (procedure.procedure_materials && Array.isArray(procedure.procedure_materials)) {
        for (const pm of procedure.procedure_materials) {
          if (pm.materials) {
            const materialCost = Number(pm.materials.cost || 0);
            const quantity = Number(pm.quantity || 1);
            const itemTotalCost = materialCost * quantity;
            
            totalCost += itemTotalCost;
            materials.push({
              name: pm.materials.name,
              cost: materialCost,
              quantity: quantity,
              totalCost: itemTotalCost
            });
          }
        }
      }
      
      // 마진 및 마진율 계산
      const margin = price - totalCost;
      const marginRate = price > 0 ? Math.round((margin / price) * 100) : 0;

      return {
        id: procedure.id,
        name: procedure.name,
        category: categoryName,
        customerPrice: price,
        totalCost: Math.round(totalCost),
        margin: Math.round(margin),
        marginRate: marginRate,
        isRecommended: Boolean(procedure.is_recommended),
        materials: materials,
        createdAt: procedure.created_at,
        updatedAt: procedure.updated_at
      };
    });

    // 마진율로 정렬 (기본)
    if (sortBy === 'marginRate') {
      proceduresWithMargin.sort((a, b) =>
        sortOrder === 'desc' ? b.marginRate - a.marginRate : a.marginRate - b.marginRate
      );
    }

    res.json({
      success: true,
      data: proceduresWithMargin,
      count: proceduresWithMargin.length,
      message: '시술 목록 조회 성공 (Supabase 연동)'
    });
  } catch (error) {
    console.error('getProcedures error:', error);
    res.status(500).json({
      success: false,
      message: '시술 목록을 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/procedures/:id - 특정 시술 조회
export const getProcedure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const procedure = await prisma.procedure.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        procedureMaterials: {
          include: {
            material: true
          }
        }
      }
    });

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message: '시술을 찾을 수 없습니다.'
      });
    }

    // 마진 계산
    const totalCost = procedure.procedureMaterials.reduce((sum, pm) => {
      const materialCost = typeof pm.material.cost === 'number' ? pm.material.cost : Number(pm.material.cost);
      const qty = typeof pm.quantity === 'number' ? pm.quantity : Number(pm.quantity);
      return sum + (materialCost * qty);
    }, 0);

    const price = typeof procedure.customerPrice === 'number' ? procedure.customerPrice : Number(procedure.customerPrice);
    const margin = price - totalCost;
    const marginRate = price > 0
      ? (margin / price) * 100
      : 0;

    const procedureWithMargin = {
      id: procedure.id,
      name: procedure.name,
      category: procedure.category?.name || '기타',
      categoryId: procedure.categoryId,
      customerPrice: price,
      totalCost,
      margin,
      marginRate: Math.round(marginRate * 10) / 10,
      isRecommended: procedure.isRecommended,
      notes: procedure.notes,
      materials: procedure.procedureMaterials.map(pm => ({
        id: pm.id,
        materialId: pm.materialId,
        name: pm.material.name,
        cost: typeof pm.material.cost === 'number' ? pm.material.cost : Number(pm.material.cost),
        quantity: typeof pm.quantity === 'number' ? pm.quantity : Number(pm.quantity)
      })),
      createdAt: procedure.createdAt,
      updatedAt: procedure.updatedAt
    };

    res.json({
      success: true,
      data: procedureWithMargin
    });
  } catch (error) {
    console.error('getProcedure error:', error);
    res.status(500).json({
      success: false,
      message: '시술 정보를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/procedures - 새 시술 생성 (Supabase)
export const createProcedure = async (req: Request, res: Response) => {
  try {
    const { name, category, customerPrice, materials, isRecommended, notes } = req.body;

    // 필수 필드 검증
    if (!name || !customerPrice) {
      return res.status(400).json({
        success: false,
        message: '시술명과 고객가격은 필수입니다.'
      });
    }

    // 카테고리 처리 (카테고리 이름으로 ID 찾기)
    let categoryId = null;
    if (category && category !== '기타') {
      // 카테고리 찾기 또는 생성
      let { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (!categoryData) {
        // 카테고리가 없으면 새로 생성
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert([{ name: category }])
          .select('id')
          .single();

        if (categoryError) {
          throw categoryError;
        }
        categoryId = newCategory.id;
      } else {
        categoryId = categoryData.id;
      }
    }

    // 시술 생성 (Supabase)
    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .insert([{
        name: name.trim(),
        category_id: categoryId,
        customer_price: parseFloat(customerPrice),
        is_recommended: isRecommended || false,
        notes: notes || null
      }])
      .select()
      .single();

    if (procedureError) {
      throw procedureError;
    }

    // 재료 관계 생성 (Supabase)
    if (materials && Array.isArray(materials)) {
      for (const material of materials) {
        await supabase
          .from('procedure_materials')
          .insert([{
            procedure_id: procedure.id,
            material_id: material.materialId,
            quantity: material.quantity || 1.0
          }]);
      }
    }

    res.status(201).json({
      success: true,
      message: '시술이 성공적으로 생성되었습니다.',
      data: {
        id: procedure.id,
        name: procedure.name,
        category: category || '기타',
        customerPrice: procedure.customer_price,
        isRecommended: procedure.is_recommended
      }
    });
  } catch (error) {
    console.error('createProcedure error:', error);
    res.status(500).json({
      success: false,
      message: '시술 생성에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT /api/procedures/:id - 시술 수정
export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, customerPrice, materials, isRecommended, notes } = req.body;

    // 시술 존재 확인 (Supabase)
    const { data: existingProcedure } = await supabase
      .from('procedures')
      .select('id')
      .eq('id', parseInt(id))
      .single();

    if (!existingProcedure) {
      return res.status(404).json({
        success: false,
        message: '시술을 찾을 수 없습니다.'
      });
    }

    // 시술 정보 수정 (Supabase)
    const updateData: any = {};
    if (name) updateData.name = name;
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (customerPrice !== undefined) updateData.customer_price = parseFloat(customerPrice);
    if (isRecommended !== undefined) updateData.is_recommended = isRecommended;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedProcedure, error: updateError } = await supabase
      .from('procedures')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 재료 관계 업데이트 (기존 관계 삭제 후 새로 생성)
    if (materials && Array.isArray(materials)) {
      // 기존 재료 관계 삭제
      await supabase
        .from('procedure_materials')
        .delete()
        .eq('procedure_id', parseInt(id));

      // 새로운 재료 관계 생성
      if (materials.length > 0) {
        const materialData = materials.map((material: any) => ({
          procedure_id: parseInt(id),
          material_id: material.materialId,
          quantity: material.quantity || 1.0
        }));

        const { error: linkError } = await supabase
          .from('procedure_materials')
          .insert(materialData);

        if (linkError) {
          throw linkError;
        }
      }
    }

    res.json({
      success: true,
      message: '시술이 성공적으로 수정되었습니다.',
      data: updatedProcedure
    });
  } catch (error) {
    console.error('updateProcedure error:', error);
    res.status(500).json({
      success: false,
      message: '시술 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// DELETE /api/procedures/:id - 시술 삭제
export const deleteProcedure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 시술 존재 확인 (Supabase)
    const { data: existingProcedure } = await supabase
      .from('procedures')
      .select('id')
      .eq('id', parseInt(id))
      .single();

    if (!existingProcedure) {
      return res.status(404).json({
        success: false,
        message: '시술을 찾을 수 없습니다.'
      });
    }

    // 관련 재료 관계 먼저 삭제
    await supabase
      .from('procedure_materials')
      .delete()
      .eq('procedure_id', parseInt(id));

    // 시술 삭제
    const { error: deleteError } = await supabase
      .from('procedures')
      .delete()
      .eq('id', parseInt(id));

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      success: true,
      message: '시술이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('deleteProcedure error:', error);
    res.status(500).json({
      success: false,
      message: '시술 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT /api/procedures/:id/recommend - 추천 시술 토글
export const toggleRecommendation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 현재 추천 상태 조회 (Supabase)
    const { data: procedure } = await supabase
      .from('procedures')
      .select('is_recommended')
      .eq('id', parseInt(id))
      .single();

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message: '시술을 찾을 수 없습니다.'
      });
    }

    // 추천 상태 토글 (Supabase)
    const { data: updatedProcedure, error } = await supabase
      .from('procedures')
      .update({
        is_recommended: !procedure.is_recommended,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: `시술이 ${updatedProcedure.is_recommended ? '추천 시술로 설정' : '추천 시술에서 해제'}되었습니다.`,
      data: updatedProcedure
    });
  } catch (error) {
    console.error('toggleRecommendation error:', error);
    res.status(500).json({
      success: false,
      message: '추천 설정 변경에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};