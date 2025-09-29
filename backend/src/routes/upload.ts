import express from 'express';
import {
  upload,
  uploadMaterials,
  uploadProcedures,
  getUploadHistory,
  downloadTemplate
} from '../controllers/uploadController';

const router = express.Router();

// 업로드 라우트
router.post('/materials', upload.single('file'), uploadMaterials);   // 재료 대량 업로드
router.post('/procedures', upload.single('file'), uploadProcedures); // 시술 대량 업로드
router.get('/history', getUploadHistory);                            // 업로드 히스토리
router.get('/templates/:type', downloadTemplate);                    // 템플릿 다운로드

export default router;