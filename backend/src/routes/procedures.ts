import express from 'express';
import {
  getProcedures,
  getProcedure,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  toggleRecommendation
} from '../controllers/procedureController';

const router = express.Router();

// 시술 관리 라우트
router.get('/', getProcedures);                    // 모든 시술 조회 (마진 계산 포함)
router.get('/:id', getProcedure);                  // 특정 시술 조회
router.post('/', createProcedure);                 // 새 시술 생성
router.put('/:id', updateProcedure);               // 시술 수정
router.delete('/:id', deleteProcedure);            // 시술 삭제
router.put('/:id/recommend', toggleRecommendation); // 추천 시술 토글

export default router;