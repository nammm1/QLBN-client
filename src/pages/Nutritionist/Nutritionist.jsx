import React, { useState } from "react";
import "./Nutritionist.css"; 

const nutritionistsList = [
  {
    id_chuyen_gia: 1,
    ho_ten: "TS.DS Nguyễn Văn A",
    hoc_vi: "Tiến sĩ, Dược sĩ",
    linh_vuc_chuyen_sau: "Dinh dưỡng lâm sàng",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Nutritionist+A",
    gioi_thieu_ban_than:
      "Chuyên gia dinh dưỡng lâm sàng, hơn 20 năm kinh nghiệm xây dựng chế độ ăn cho bệnh nhân tim mạch, tiểu đường.",
  },
  {
    id_chuyen_gia: 2,
    ho_ten: "ThS.DS Trần Thị B",
    hoc_vi: "Thạc sĩ, Dược sĩ",
    linh_vuc_chuyen_sau: "Dinh dưỡng cộng đồng",
    chuc_vu: "Phó khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Nutritionist+B",
    gioi_thieu_ban_than:
      "Chuyên nghiên cứu chế độ ăn cân bằng cho trẻ em và người cao tuổi.",
  },
  {
    id_chuyen_gia: 3,
    ho_ten: "CN Dinh dưỡng Lê Văn C",
    hoc_vi: "Cử nhân Dinh dưỡng",
    linh_vuc_chuyen_sau: "Dinh dưỡng vận động",
    chuc_vu: "Chuyên gia",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Nutritionist+C",
    gioi_thieu_ban_than:
      "Tư vấn dinh dưỡng cho vận động viên chuyên nghiệp và người tập luyện thể hình.",
  },
  {
    id_chuyen_gia: 4,
    ho_ten: "BSCKI Phạm Thị D",
    hoc_vi: "Bác sĩ chuyên khoa I",
    linh_vuc_chuyen_sau: "Dinh dưỡng nhi khoa",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Nutritionist+D",
    gioi_thieu_ban_than:
      "Chuyên điều trị suy dinh dưỡng, béo phì ở trẻ em và tư vấn chế độ ăn khoa học.",
  },
  // 👉 Bạn có thể thêm tiếp danh sách tùy ý
];

const Nutritionist = () => {
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const nutritionistsPerPage = 8;
  const indexOfLast = currentPage * nutritionistsPerPage;
  const indexOfFirst = indexOfLast - nutritionistsPerPage;
  const currentNutritionists = nutritionistsList.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(nutritionistsList.length / nutritionistsPerPage);

  return (
    <div className="container doctors-container">
      <h2 className="fw-bold mt-4 mb-4 position-relative d-inline-block">
        Chuyên gia dinh dưỡng
        <span className="underline"></span>
      </h2>

      <div className="row g-4">
        {currentNutritionists.map((nutri) => (
          <div key={nutri.id_chuyen_gia} className="col-md-6">
            <div
              className="doctor-card d-flex align-items-center p-3 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedNutritionist(nutri)}
            >
              <img
                src={nutri.anh_dai_dien}
                alt={nutri.ho_ten}
                className="doctor-img me-3"
                style={{ width: "100px", height: "120px", objectFit: "cover" }}
              />
              <div>
                <h5 className="text-primary fw-bold">{nutri.ho_ten}</h5>
                <p className="mb-1">🎓 {nutri.hoc_vi}</p>
                <p className="mb-1">🥗 {nutri.linh_vuc_chuyen_sau}</p>
                <p className="mb-0">👩‍⚕️ {nutri.chuc_vu}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination mt-4 d-flex justify-content-center">
        <button
          className="btn btn-sm btn-outline-primary mx-1"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          &lt;
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-sm mx-1 ${
              currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="btn btn-sm btn-outline-primary mx-1"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          &gt;
        </button>
      </div>

      {/* Modal chi tiết */}
      {selectedNutritionist && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedNutritionist.ho_ten}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedNutritionist(null)}
                ></button>
              </div>
              <div className="modal-body d-flex">
                <img
                  src={selectedNutritionist.anh_dai_dien}
                  alt={selectedNutritionist.ho_ten}
                  className="me-3"
                  style={{ width: "150px", height: "180px", objectFit: "cover" }}
                />
                <div>
                  <p>
                    <strong>Chức danh:</strong> {selectedNutritionist.hoc_vi}
                  </p>
                  <p>
                    <strong>Chuyên ngành:</strong> {selectedNutritionist.linh_vuc_chuyen_sau}
                  </p>
                  <p>
                    <strong>Chức vụ:</strong> {selectedNutritionist.chuc_vu}
                  </p>
                  <p>
                    <strong>Giới thiệu:</strong> {selectedNutritionist.gioi_thieu_ban_than}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedNutritionist(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutritionist;
