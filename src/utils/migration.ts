import { proceduresApi, procedureMaterialsApi } from '../services/api';

export const migrateProcedureMaterials = async () => {
  try {
    // 1. 모든 시술 데이터 가져오기
    const procedures = await proceduresApi.getAll();
    
    // 2. 각 시술의 재료 데이터 마이그레이션
    for (const procedure of procedures) {
      if (procedure.materials && procedure.materials.length > 0) {
        await procedureMaterialsApi.updateProcedureMaterials(
          procedure.id,
          procedure.materials
        );
      }
    }

    console.log('재료 데이터 마이그레이션이 완료되었습니다.');
    return true;
  } catch (error) {
    console.error('재료 데이터 마이그레이션 중 오류 발생:', error);
    return false;
  }
}; 