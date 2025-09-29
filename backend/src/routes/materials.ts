import express from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../controllers/materialController';

const router = express.Router();

// 재료 관리 라우트
router.get('/', getMaterials);           // 모든 재료 조회
router.get('/:id', getMaterial);         // 특정 재료 조회
router.post('/', createMaterial);        // 새 재료 생성
router.put('/:id', updateMaterial);      // 재료 수정
router.delete('/:id', deleteMaterial);   // 재료 삭제

export default router;