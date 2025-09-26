import React, { useState } from "react";
import "./Doctors.css";

const doctorsList = [
  {
    id_bac_si: 1,
    ho_ten: "PGS.TS.BS Phạm Nguyễn Vinh",
    chuc_danh: "Phó Giáo sư, Tiến sĩ, Bác sĩ",
    chuyen_mon: "Tim mạch",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Vinh",
    gioi_thieu_ban_than: "BS Phạm Nguyễn Vinh là chuyên gia đầu ngành Nội tim mạch tại Việt Nam, với hơn 30 năm kinh nghiệm chẩn đoán và điều trị các bệnh lý tim mạch phức tạp, từng tu nghiệp tại Pháp.",
  },
  {
    id_bac_si: 2,
    ho_ten: "TS.BS Đỗ Minh Hùng",
    chuc_danh: "Tiến sĩ, Bác sĩ",
    chuyen_mon: "Tim mạch",
    chuc_vu: "Phó khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Hùng",
    gioi_thieu_ban_than: "BS Đỗ Minh Hùng có gần 30 năm kinh nghiệm trong lĩnh vực tim mạch, chuyên về can thiệp tim mạch và điều trị bệnh lý mạch vành.",
  },
  {
    id_bac_si: 3,
    ho_ten: "ThS.BS Chu Tấn Sĩ",
    chuc_danh: "Thạc sĩ, Bác sĩ Chuyên khoa II",
    chuyen_mon: "Thần kinh",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Sĩ",
    gioi_thieu_ban_than: "BS Chu Tấn Sĩ có hơn 30 năm kinh nghiệm ngoại thần kinh, chuyên phẫu thuật các bệnh lý não và cột sống, từng học tập tại các trung tâm hàng đầu quốc tế.",
  },
  {
    id_bac_si: 4,
    ho_ten: "TS.BS Cao Vũ Hùng",
    chuc_danh: "Tiến sĩ, Bác sĩ",
    chuyen_mon: "Thần kinh",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Hùng",
    gioi_thieu_ban_than: "BS Cao Vũ Hùng là Giám đốc Trung tâm Thần kinh, chuyên nội thần kinh với kinh nghiệm điều trị đột quỵ và động kinh.",
  },
  {
    id_bac_si: 5,
    ho_ten: "TTƯT.PGS.TS Vũ Chí Dũng",
    chuc_danh: "Phó Giáo sư, Tiến sĩ, Bác sĩ",
    chuyen_mon: "Nội tiết",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Dũng",
    gioi_thieu_ban_than: "BS Vũ Chí Dũng có hơn 25 năm kinh nghiệm nội tiết - chuyển hóa, chuyên điều trị tiểu đường và rối loạn tuyến giáp.",
  },
  {
    id_bac_si: 6,
    ho_ten: "BS Thùy Nga",
    chuc_danh: "Bác sĩ",
    chuyen_mon: "Nội tiết",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Nga",
    gioi_thieu_ban_than: "BS Thùy Nga chuyên về nội tiết ở trẻ em, với kinh nghiệm tư vấn dinh dưỡng và điều trị suy dinh dưỡng.",
  },
  {
    id_bac_si: 7,
    ho_ten: "PGS.TS Lê Thị Hồng Hanh",
    chuc_danh: "Phó Giáo sư, Tiến sĩ",
    chuyen_mon: "Hô hấp",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Hanh",
    gioi_thieu_ban_than: "BS Lê Thị Hồng Hanh là Giám đốc Trung tâm Hô hấp, hơn 20 năm kinh nghiệm điều trị hen suyễn và COPD ở trẻ em.",
  },
  {
    id_bac_si: 8,
    ho_ten: "BS Nguyễn Bá Mỹ Nhi",
    chuc_danh: "Bác sĩ Chuyên khoa II",
    chuyen_mon: "Hô hấp",
    chuc_vu: "Phó khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Nhi",
    gioi_thieu_ban_than: "BS Nguyễn Bá Mỹ Nhi chuyên hô hấp nhi khoa, với kinh nghiệm xử lý các bệnh lý phổi nhiễm trùng.",
  },
  {
    id_bac_si: 9,
    ho_ten: "ThS.BS Lê Thị Lan Anh",
    chuc_danh: "Thạc sĩ, Bác sĩ",
    chuyen_mon: "Da liễu",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Lan+Anh",
    gioi_thieu_ban_than: "BS Lê Thị Lan Anh có 20 năm kinh nghiệm da liễu, chuyên điều trị vảy nến và thẩm mỹ da.",
  },
  {
    id_bac_si: 10,
    ho_ten: "BS Nguyễn Thị Hạnh Trang",
    chuc_danh: "Bác sĩ Chuyên khoa I",
    chuyen_mon: "Da liễu",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Trang",
    gioi_thieu_ban_than: "BS Nguyễn Thị Hạnh Trang chuyên da liễu nhi, điều trị các bệnh da ở trẻ em như chàm và dị ứng.",
  },
  {
    id_bac_si: 11,
    ho_ten: "TS.BS Cam Ngọc Phượng",
    chuc_danh: "Tiến sĩ, Bác sĩ",
    chuyen_mon: "Mắt",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Phượng",
    gioi_thieu_ban_than: "BS Cam Ngọc Phượng hơn 30 năm kinh nghiệm nhãn khoa, chuyên phẫu thuật đục thủy tinh thể và Lasik.",
  },
  {
    id_bac_si: 12,
    ho_ten: "BS Tăng Hà Nam Anh",
    chuc_danh: "Bác sĩ",
    chuyen_mon: "Mắt",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Anh",
    gioi_thieu_ban_than: "BS Tăng Hà Nam Anh chuyên khám mắt trẻ em và điều trị cận thị.",
  },
  {
    id_bac_si: 13,
    ho_ten: "TS.BS Bùi Thị Phương Nga",
    chuc_danh: "Tiến sĩ, Bác sĩ",
    chuyen_mon: "Sản",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Nga",
    gioi_thieu_ban_than: "BS Bùi Thị Phương Nga có 30 năm kinh nghiệm sản phụ khoa, chuyên hỗ trợ sinh sản IVF.",
  },
  {
    id_bac_si: 14,
    ho_ten: "BS Nguyễn Thanh Tâm",
    chuc_danh: "Bác sĩ",
    chuyen_mon: "Sản",
    chuc_vu: "Phó khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Tâm",
    gioi_thieu_ban_than: "BS Nguyễn Thanh Tâm chuyên sàn chậu nữ và phục hồi sau sinh.",
  },
  {
    id_bac_si: 15,
    ho_ten: "PGS.TS.BS Trần Văn Hinh",
    chuc_danh: "Phó Giáo sư, Tiến sĩ, Bác sĩ Chuyên khoa II",
    chuyen_mon: "Ngoại tổng quát",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Hinh",
    gioi_thieu_ban_than: "BS Trần Văn Hinh hơn 30 năm kinh nghiệm phẫu thuật tiết niệu và ghép thận.",
  },
  {
    id_bac_si: 16,
    ho_ten: "GS.TS.BS Trần Quán Anh",
    chuc_danh: "Giáo sư, Tiến sĩ, Bác sĩ",
    chuyen_mon: "Ngoại tổng quát",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Anh",
    gioi_thieu_ban_than: "BS Trần Quán Anh là người sáng lập nam học Việt Nam, chuyên tiết niệu nam khoa.",
  },
  {
    id_bac_si: 17,
    ho_ten: "ThS.BS Nguyễn Thị Ngọc Nga",
    chuc_danh: "Thạc sĩ, Bác sĩ",
    chuyen_mon: "Răng hàm mặt",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Nga",
    gioi_thieu_ban_than: "BS Nguyễn Thị Ngọc Nga chuyên chỉnh nha và implant răng.",
  },
  {
    id_bac_si: 18,
    ho_ten: "BS Phạm Hữu Hòa",
    chuc_danh: "Bác sĩ Cao cấp",
    chuyen_mon: "Tai mũi họng",
    chuc_vu: "Phó khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Hòa",
    gioi_thieu_ban_than: "BS Phạm Hữu Hòa chuyên can thiệp tai mũi họng ở trẻ em.",
  },
  {
    id_bac_si: 19,
    ho_ten: "TS.BS Trần Hải Bình",
    chuc_danh: "Tiến sĩ, Bác sĩ",
    chuyen_mon: "Ung bướu",
    chuc_vu: "Trưởng khoa",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Bình",
    gioi_thieu_ban_than: "BS Trần Hải Bình là Phó khoa Ung bướu, chuyên hóa trị và xạ trị ung thư.",
  },
  {
    id_bac_si: 20,
    ho_ten: "BS Trần Vương Thảo Nghi",
    chuc_danh: "Bác sĩ",
    chuyen_mon: "Ung bướu",
    chuc_vu: "Bác sĩ điều trị",
    anh_dai_dien: "https://via.placeholder.com/150x200.png?text=Doctor+Nghi",
    gioi_thieu_ban_than: "BS Trần Vương Thảo Nghi có gần 20 năm kinh nghiệm ung bướu, chuyên điều trị thành công nhiều ca khó.",
  },
];

const Doctors = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const doctorsPerPage = 8; // ✅ 8 bác sĩ / trang

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctorsList.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const totalPages = Math.ceil(doctorsList.length / doctorsPerPage);

  return (
    <div className="container doctors-container">
      {/* Danh sách bác sĩ */}
      <h2 className="fw-bold mt-4 mb-4 position-relative d-inline-block">
        Danh sách bác sĩ
        <span className="underline"></span>
      </h2>

      <div className="row g-4">
        {currentDoctors.map((doc) => (
          <div key={doc.id_bac_si} className="col-md-6">
            <div
              className="doctor-card d-flex align-items-center p-3 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedDoctor(doc)}
            >
              <img
                src={doc.anh_dai_dien}
                alt={doc.ho_ten}
                className="doctor-img me-3"
                style={{ width: "100px", height: "120px", objectFit: "cover" }}
              />
              <div>
                <h5 className="text-primary fw-bold">{doc.ho_ten}</h5>
                <p className="mb-1">🎓 {doc.chuc_danh}</p>
                <p className="mb-1">🩺 {doc.chuyen_mon}</p>
                <p className="mb-0">👨‍⚕️ {doc.chuc_vu}</p>
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
      {selectedDoctor && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedDoctor.ho_ten}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedDoctor(null)}
                ></button>
              </div>
              <div className="modal-body d-flex">
                <img
                  src={selectedDoctor.anh_dai_dien}
                  alt={selectedDoctor.ho_ten}
                  className="me-3"
                  style={{
                    width: "150px",
                    height: "180px",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p>
                    <strong>Chức danh:</strong> {selectedDoctor.chuc_danh}
                  </p>
                  <p>
                    <strong>Chuyên khoa:</strong> {selectedDoctor.chuyen_mon}
                  </p>
                  <p>
                    <strong>Chức vụ:</strong> {selectedDoctor.chuc_vu}
                  </p>
                  <p>
                    <strong>Giới thiệu:</strong> {selectedDoctor.gioi_thieu_ban_than}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedDoctor(null)}
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

export default Doctors;
