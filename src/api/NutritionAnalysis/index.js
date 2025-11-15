import axiosInstance from '../axios';
import API_CONFIG from '../../configs/api_configs.js';

const nutritionAnalysisService = {
  /**
   * Phân tích lý do tư vấn và gợi ý chuyên ngành dinh dưỡng
   * @param {string} ly_do_tu_van - Lý do tư vấn
   * @param {string} trieu_chung - Triệu chứng (optional)
   * @returns {Promise<{success: boolean, data: object}>}
   */
  analyzeNutrition: async (ly_do_tu_van, trieu_chung = '') => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NutritionAnalysis}/analyze`,
        {
          ly_do_tu_van: ly_do_tu_van.trim(),
          trieu_chung: trieu_chung ? trieu_chung.trim() : ''
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      throw error;
    }
  }
};

export default nutritionAnalysisService;

