const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getMoMComparison,
  getForecast,
  getBehavioral,
  getHealthScore,
  getInsights,
  getDailyHeatmap,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/monthly', getMonthlyTrends);
router.get('/mom', getMoMComparison);
router.get('/forecast', getForecast);
router.get('/behavioral', getBehavioral);
router.get('/health', getHealthScore);
router.get('/insights', getInsights);
router.get('/heatmap', getDailyHeatmap);

module.exports = router;
