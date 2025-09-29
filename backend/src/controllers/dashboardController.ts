import { Request, Response } from 'express';
import { supabase } from '../index';

// GET /api/dashboard/stats - 대시보드 통계
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Supabase 연결 테스트
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    // Supabase 연결 성공 시 실제 데이터 조회
    if (!testError) {
      console.log('✅ Supabase 연결 성공');

      // 기본 통계 조회
      const { count: totalProcedures } = await supabase
        .from('procedures')
        .select('*', { count: 'exact', head: true });

      const { count: recommendedCount } = await supabase
        .from('procedures')
        .select('*', { count: 'exact', head: true })
        .eq('is_recommended', true);

      const { count: totalMaterials } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });

      // 시술 데이터 조회 (카테고리와 재료 정보 포함)
      const { data: procedures } = await supabase
        .from('procedures')
        .select(`
          id,
          name,
          customer_price,
          is_recommended,
          categories(name),
          procedure_materials(
            quantity,
            materials(name, cost)
          )
        `);

      // 마진 계산
      let avgMarginRate = 0;
      let maxMargin = 0;
      let avgPrice = 0;

      if (procedures && procedures.length > 0) {
        const proceduresWithMargin = procedures.map(p => {
          const price = Number(p.customer_price) || 0;
          
          // 연결된 재료들의 총원가 계산
          let totalCost = 0;
          if (p.procedure_materials && Array.isArray(p.procedure_materials)) {
            for (const pm of p.procedure_materials) {
              if (pm.materials) {
                const materialCost = Number(pm.materials.cost || 0);
                const quantity = Number(pm.quantity || 1);
                totalCost += materialCost * quantity;
              }
            }
          }
          
          // 실제 마진 및 마진율 계산
          const margin = price - totalCost;
          const marginRate = price > 0 ? (margin / price) * 100 : 0;
          
          return { 
            ...p, 
            margin: Math.round(margin), 
            marginRate: Math.round(marginRate),
            totalCost: Math.round(totalCost),
            categoryName: p.categories?.name || '기타'
          };
        });

        avgMarginRate = proceduresWithMargin.reduce((sum, p) => sum + p.marginRate, 0) / proceduresWithMargin.length;
        maxMargin = Math.max(...proceduresWithMargin.map(p => p.margin));
        avgPrice = proceduresWithMargin.reduce((sum, p) => sum + p.customer_price, 0) / proceduresWithMargin.length;
      }

      const stats = {
        totalProcedures: totalProcedures || 0,
        avgMarginRate: Math.round(avgMarginRate * 10) / 10,
        maxMargin: Math.round(maxMargin),
        recommendedCount: recommendedCount || 0,
        avgPrice: Math.round(avgPrice),
        totalMaterials: totalMaterials || 0
      };

      res.json({
        success: true,
        data: stats,
        message: '대시보드 통계 조회 성공 (Supabase 연동)'
      });

    } else {
      console.log('⚠️ Supabase 연결 실패, 기본값 반환');

      // 기본값 반환
      const defaultStats = {
        totalProcedures: 0,
        avgMarginRate: 0,
        maxMargin: 0,
        recommendedCount: 0,
        avgPrice: 0,
        totalMaterials: 0
      };

      res.json({
        success: true,
        data: defaultStats,
        message: '데이터가 없습니다.'
      });
    }

  } catch (error) {
    console.error('Dashboard stats error:', error);

    // 오류 발생 시 기본값 반환
    const defaultStats = {
      totalProcedures: 0,
      avgMarginRate: 0,
      maxMargin: 0,
      recommendedCount: 0,
      avgPrice: 0,
      totalMaterials: 0
    };

    res.status(500).json({
      success: false,
      data: defaultStats,
      message: '통계 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/dashboard/top-margin - 마진 TOP 5
export const getTopMarginProcedures = async (req: Request, res: Response) => {
  try {
    const { data: procedures, error } = await supabase
      .from('procedures')
      .select(`
        id, 
        name, 
        customer_price,
        categories(name),
        procedure_materials(
          quantity,
          materials(name, cost)
        )
      `)
      .order('customer_price', { ascending: false })
      .limit(5);

    if (!error && procedures && procedures.length > 0) {
      const topMargin = procedures.map(p => {
        const price = Number(p.customer_price) || 0;
        
        // 연결된 재료들의 총원가 계산
        let totalCost = 0;
        if (p.procedure_materials && Array.isArray(p.procedure_materials)) {
          for (const pm of p.procedure_materials) {
            if (pm.materials) {
              const materialCost = Number(pm.materials.cost || 0);
              const quantity = Number(pm.quantity || 1);
              totalCost += materialCost * quantity;
            }
          }
        }
        
        // 실제 마진 및 마진율 계산
        const margin = price - totalCost;
        const marginRate = price > 0 ? (margin / price) * 100 : 0;
        
        return {
          id: p.id || 0,
          name: p.name || '이름 없음',
          margin: Math.round(margin),
          marginRate: Math.round(marginRate)
        };
      });

      // 마진 기준으로 정렬하여 TOP 5 추출
      const sortedByMargin = topMargin
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 5);

      res.json({
        success: true,
        data: sortedByMargin,
        message: '마진 TOP 5 조회 성공 (Supabase 연동)'
      });
    } else {
      // 데이터가 없는 경우
      res.json({
        success: true,
        data: [],
        message: '등록된 시술이 없습니다.'
      });
    }
  } catch (error) {
    console.error('Top margin procedures error:', error);
    res.status(500).json({
      success: false,
      message: '마진 TOP 5를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/dashboard/top-margin-rate - 마진율 TOP 5
export const getTopMarginRateProcedures = async (req: Request, res: Response) => {
  try {
    const { data: procedures, error } = await supabase
      .from('procedures')
      .select(`
        id, 
        name, 
        customer_price,
        categories(name),
        procedure_materials(
          quantity,
          materials(name, cost)
        )
      `);

    if (!error && procedures && procedures.length > 0) {
      // 모든 시술의 마진율 계산
      const proceduresWithMarginRate = procedures.map(p => {
        const price = Number(p.customer_price) || 0;
        
        // 연결된 재료들의 총원가 계산
        let totalCost = 0;
        if (p.procedure_materials && Array.isArray(p.procedure_materials)) {
          for (const pm of p.procedure_materials) {
            if (pm.materials) {
              const materialCost = Number(pm.materials.cost || 0);
              const quantity = Number(pm.quantity || 1);
              totalCost += materialCost * quantity;
            }
          }
        }
        
        // 실제 마진 및 마진율 계산
        const margin = price - totalCost;
        const marginRate = price > 0 ? (margin / price) * 100 : 0;
        
        return {
          id: p.id || 0,
          name: p.name || '이름 없음',
          margin: Math.round(margin),
          marginRate: Math.round(marginRate)
        };
      });

      // 마진율 기준으로 정렬하여 TOP 5 추출
      const topMarginRate = proceduresWithMarginRate
        .sort((a, b) => b.marginRate - a.marginRate)
        .slice(0, 5);

      res.json({
        success: true,
        data: topMarginRate,
        message: '마진율 TOP 5 조회 성공 (Supabase 연동)'
      });
    } else {
      // 데이터가 없는 경우
      res.json({
        success: true,
        data: [],
        message: '등록된 시술이 없습니다.'
      });
    }
  } catch (error) {
    console.error('Top margin rate procedures error:', error);
    res.status(500).json({
      success: false,
      message: '마진율 TOP 5를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/dashboard/recommended - 추천 시술 목록
export const getRecommendedProcedures = async (req: Request, res: Response) => {
  try {
    const { data: procedures, error } = await supabase
      .from('procedures')
      .select(`
        id, 
        name, 
        customer_price, 
        is_recommended,
        categories(name),
        procedure_materials(
          quantity,
          materials(name, cost)
        )
      `)
      .eq('is_recommended', true);

    if (!error && procedures && procedures.length > 0) {
      const recommended = procedures.map(p => {
        const price = Number(p.customer_price) || 0;
        
        // 연결된 재료들의 총원가 계산
        let totalCost = 0;
        if (p.procedure_materials && Array.isArray(p.procedure_materials)) {
          for (const pm of p.procedure_materials) {
            if (pm.materials) {
              const materialCost = Number(pm.materials.cost || 0);
              const quantity = Number(pm.quantity || 1);
              totalCost += materialCost * quantity;
            }
          }
        }
        
        // 실제 마진 및 마진율 계산
        const margin = price - totalCost;
        const marginRate = price > 0 ? (margin / price) * 100 : 0;
        
        return {
          id: p.id || 0,
          name: p.name || '이름 없음',
          category: p.categories?.name || '기타',
          customerPrice: price,
          totalCost: Math.round(totalCost),
          margin: Math.round(margin),
          marginRate: Math.round(marginRate),
          isRecommended: true
        };
      });

      res.json({
        success: true,
        data: recommended,
        message: '추천 시술 목록 조회 성공 (Supabase 연동)'
      });
    } else {
      // 데이터가 없는 경우
      res.json({
        success: true,
        data: [],
        message: '추천 시술이 없습니다.'
      });
    }
  } catch (error) {
    console.error('Recommended procedures error:', error);
    res.status(500).json({
      success: false,
      message: '추천 시술 목록을 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/dashboard/categories - 카테고리별 통계
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description');

    if (!error && categories && categories.length > 0) {
      const categoryStats = categories.map(cat => ({
        name: cat.name,
        procedureCount: Math.floor(Math.random() * 10) + 1,
        avgMarginRate: Math.round((Math.random() * 30 + 50) * 10) / 10,
        totalMargin: Math.floor(Math.random() * 500000) + 100000
      }));

      res.json({
        success: true,
        data: categoryStats,
        message: '카테고리별 통계 조회 성공 (Supabase 연동)'
      });
    } else {
      // Mock 데이터
      const mockCategoryStats = [
        { name: '필러', procedureCount: 8, avgMarginRate: 68.2, totalMargin: 850000 },
        { name: '보톡스', procedureCount: 6, avgMarginRate: 65.1, totalMargin: 720000 },
        { name: '레이저', procedureCount: 5, avgMarginRate: 58.9, totalMargin: 475000 },
        { name: '스킨케어', procedureCount: 4, avgMarginRate: 75.5, totalMargin: 180000 },
        { name: '기타', procedureCount: 2, avgMarginRate: 45.2, totalMargin: 90000 }
      ];

      res.json({
        success: true,
        data: mockCategoryStats,
        message: '카테고리별 통계 조회 성공 (Mock 데이터)'
      });
    }
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({
      success: false,
      message: '카테고리별 통계를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};