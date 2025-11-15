import axiosInstance from '../axios';
import API_CONFIG from '../../configs/api_configs.js';

const symptomAnalysisService = {
  /**
   * Phân tích triệu chứng và gợi ý chuyên khoa
   * @param {string} ly_do_kham - Lý do khám
   * @param {string} trieu_chung - Triệu chứng (optional)
   * @returns {Promise<{success: boolean, data: object}>}
   */
  analyzeSymptoms: async (ly_do_kham, trieu_chung = '') => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.SymptomAnalysis}/analyze`,
        {
          ly_do_kham: ly_do_kham.trim(),
          trieu_chung: trieu_chung ? trieu_chung.trim() : ''
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  }
};

export default symptomAnalysisService;

