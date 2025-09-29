import express from 'express';
import {
  getDashboardStats,
  getTopMarginProcedures,
  getTopMarginRateProcedures,
  getRecommendedProcedures,
  getCategoryStats
} from '../controllers/dashboardController';

const router = express.Router();

// 대시보드 라우트
router.get('/stats', getDashboardStats);              // 전체 통계
router.get('/top-margin', getTopMarginProcedures);    // 마진 TOP 5
router.get('/top-margin-rate', getTopMarginRateProcedures); // 마진율 TOP 5
router.get('/recommended', getRecommendedProcedures);  // 추천 시술 목록
router.get('/categories', getCategoryStats);           // 카테고리별 통계

export default router;