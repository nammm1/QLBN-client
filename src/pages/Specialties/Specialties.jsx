import React, { useState } from "react";
import "./Specialties.css";

// Danh sách chuyên khoa 
const specialtiesList = [
  {
    id_chuyen_khoa: 1,
    ten_chuyen_khoa: "KHOA NGOẠI NHI",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2025/05/icon-khoa-ngoai-nhi-tam-anh.png",
    mo_ta: "Được thành lập với sứ mệnh trở thành địa chỉ khám, điều trị và phẫu thuật chuyên sâu cho trẻ em. Với đội ngũ y bác sĩ giàu kinh nghiệm cùng hệ thống trang thiết bị hiện đại, khoa Ngoại Nhi áp dụng các phương pháp điều trị tiên tiến, an toàn và thân thiện với trẻ nhỏ, được nhiều gia đình an tâm tin tưởng.",
    thiet_bi: "Trang thiết bị hiện đại, phòng mổ chuyên biệt cho trẻ.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 2,
    ten_chuyen_khoa: "KHOA TIM MẠCH",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-noitimmach.png",
    mo_ta: "Chuyên cung cấp các dịch vụ chẩn đoán, điều trị và phòng ngừa các bệnh lý tim mạch. Khoa quy tụ đội ngũ chuyên gia đầu ngành, kết hợp với công nghệ chẩn đoán hình ảnh và can thiệp tim mạch tiên tiến, đảm bảo hiệu quả điều trị tối ưu cho bệnh nhân.",
    thiet_bi: "Máy siêu âm tim Doppler, máy đo điện tim, phòng can thiệp tim mạch hiện đại.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 3,
    ten_chuyen_khoa: "KHOA THẦN KINH",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-noithankinh.png",
    mo_ta: "Tập trung vào chẩn đoán và điều trị các bệnh lý thần kinh như đột quỵ, động kinh, Parkinson. Khoa sở hữu đội ngũ bác sĩ giàu kinh nghiệm và hệ thống máy móc hiện đại, hỗ trợ điều trị cả nội khoa và ngoại khoa thần kinh.",
    thiet_bi: "Máy chụp MRI 3 Tesla, máy đo điện não đồ, phòng phẫu thuật thần kinh chuyên biệt.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 4,
    ten_chuyen_khoa: "KHOA NỘI TIẾT",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-noitiet.png",
    mo_ta: "Chuyên điều trị các rối loạn nội tiết và chuyển hóa như tiểu đường, bệnh tuyến giáp, rối loạn lipid_chuyen_khoa máu. Khoa cung cấp dịch vụ tư vấn dinh dưỡng và điều trị cá nhân hóa với công nghệ tiên tiến.",
    thiet_bi: "Máy đo đường huyết liên tục, hệ thống xét nghiệm nội tiết hiện đại.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 6 (8h00 - 16h30)",
  },
  {
    id_chuyen_khoa: 5,
    ten_chuyen_khoa: "KHOA HÔ HẤP",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-noihohap.png",
    mo_ta: "Chuyên khám và điều trị các bệnh lý về phổi và đường hô hấp như hen suyễn, COPD, viêm phổi. Khoa sử dụng các công nghệ chẩn đoán tiên tiến và liệu pháp điều trị hiện đại, giúp bệnh nhân nhanh chóng hồi phục.",
    thiet_bi: "Máy đo chức năng hô hấp, nội soi phế quản, hệ thống oxy cao áp.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 6,
    ten_chuyen_khoa: "KHOA DA LIỄU",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2023/04/khoa-da-lieu.png",
    mo_ta: "Cung cấp dịch vụ khám, điều trị và thẩm mỹ da liễu, từ các bệnh lý da thông thường đến các vấn đề phức tạp như vảy nến, chàm. Khoa áp dụng công nghệ laser và liệu pháp ánh sáng hiện đại.",
    thiet_bi: "Máy laser thẩm mỹ, hệ thống ánh sáng sinh học, phòng tiểu phẫu da liễu.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (8h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 7,
    ten_chuyen_khoa: "KHOA MẮT",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2024/02/trung-tam-mat-cong-nghe-cao.png",
    mo_ta: "Chuyên cung cấp dịch vụ khám, điều trị và phẫu thuật các bệnh lý về mắt như đục thủy tinh thể, cận thị, viễn thị. Khoa sở hữu công nghệ phẫu thuật tiên tiến và đội ngũ chuyên gia nhãn khoa hàng đầu.",
    thiet_bi: "Máy phẫu thuật Lasik, máy đo thị lực tự động, phòng mổ nhãn khoa vô trùng.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 8,
    ten_chuyen_khoa: "KHOA SẢN",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-ivf.png",
    mo_ta: "Cung cấp dịch vụ chăm sóc sức khỏe sinh sản, hỗ trợ sinh sản và điều trị vô sinh. Khoa áp dụng các kỹ thuật tiên tiến như thụ tinh trong ống nghiệm (IVF), mang lại hy vọng cho nhiều cặp vợ chồng.",
    thiet_bi: "Phòng lab IVF hiện đại, hệ thống siêu âm 4D, phòng sinh tiêu chuẩn quốc tế.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 9,
    ten_chuyen_khoa: "KHOA NGOẠI TỔNG QUÁT",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2023/04/icon-ngoaitonghop.png",
    mo_ta: "Chuyên thực hiện các ca phẫu thuật tổng quát như cắt ruột thừa, thoát vị, và các bệnh lý ngoại khoa khác. Khoa sử dụng kỹ thuật phẫu thuật nội soi tiên tiến, đảm bảo an toàn và hồi phục nhanh.",
    thiet_bi: "Phòng mổ nội soi hiện đại, máy siêu âm Doppler, hệ thống gây mê tiên tiến.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h00 - 16h30)",
  },
  {
    id_chuyen_khoa: 10,
    ten_chuyen_khoa: "KHOA RĂNG HÀM MẶT",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2023/12/khoa-rang-ham-mat.png",
    mo_ta: "Chuyên cung cấp dịch vụ khám, điều trị và thẩm mỹ răng hàm mặt, từ chỉnh nha đến cấy ghép implant. Khoa sở hữu đội ngũ bác sĩ nha khoa giàu kinh nghiệm và công nghệ nha khoa tiên tiến.",
    thiet_bi: "Máy chụp X-quang toàn hàm, ghế nha khoa hiện đại, hệ thống cấy ghép implant.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (8h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 11,
    ten_chuyen_khoa: "KHOA TAI MŨI HỌNG",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2021/03/khoa-tai-mui-hong.png",
    mo_ta: "Chuyên chẩn đoán và điều trị các bệnh lý tai mũi họng như viêm xoang, viêm amidan, ù tai. Khoa sử dụng kỹ thuật nội soi và phẫu thuật vi phẫu, đảm bảo hiệu quả điều trị cao.",
    thiet_bi: "Máy nội soi tai mũi họng, hệ thống phẫu thuật vi phẫu, phòng khám chuyên biệt.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 6 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 12,
    ten_chuyen_khoa: "KHOA DINH DƯỠNG",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2021/07/icon-chuyen-khoa-dinh-duong.png",
    mo_ta: "Cung cấp dịch vụ tư vấn dinh dưỡng cá nhân hóa, hỗ trợ điều trị các bệnh lý liên quan đến dinh dưỡng như béo phì, suy dinh dưỡng. Khoa giúp bệnh nhân xây dựng chế độ ăn uống khoa học.",
    thiet_bi: "Máy phân tích thành phần cơ thể, phần mềm tư vấn dinh dưỡng, phòng tư vấn riêng.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 6 (8h00 - 16h30)",
  },
  {
    id_chuyen_khoa: 13,
    ten_chuyen_khoa: "KHOA NHI",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2021/03/khoa-nhi.png",
    mo_ta: "Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến vị thành niên. Khoa cung cấp dịch vụ khám, điều trị và tiêm chủng với môi trường thân thiện, giúp trẻ và gia đình cảm thấy thoải mái.",
    thiet_bi: "Phòng khám nhi khoa hiện đại, khu vui chơi cho trẻ, máy siêu âm chuyên dụng.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 14,
    ten_chuyen_khoa: "KHOA UNG BỨU",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/icon-ung-buou-chuyen-khoa.png",
    mo_ta: "Chuyên chẩn đoán, điều trị và chăm sóc bệnh nhân ung thư với các phương pháp hiện đại như hóa trị, xạ trị và điều trị đích. Khoa có đội ngũ chuyên gia ung bướu hàng đầu.",
    thiet_bi: "Máy xạ trị gia tốc tuyến tính, phòng hóa trị vô trùng, hệ thống chẩn đoán hình ảnh PET/CT.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 15,
    ten_chuyen_khoa: "KHOA DƯỢC",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-duoc.png",
    mo_ta: "Quản lý và cung ứng thuốc, đảm bảo chất lượng và an toàn trong sử dụng thuốc. Khoa cung cấp dịch vụ tư vấn sử dụng thuốc hợp lý và hỗ trợ các khoa lâm sàng.",
    thiet_bi: "Hệ thống quản lý dược phẩm tự động, kho bảo quản thuốc đạt chuẩn GPP.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 16,
    ten_chuyen_khoa: "KHOA PHỤC HỒI CHỨC NĂNG",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2023/04/khoa-phuc-hoi-chuc-nang.png",
    mo_ta: "Chuyên cung cấp các liệu pháp phục hồi chức năng cho bệnh nhân sau chấn thương, đột quỵ hoặc phẫu thuật. Khoa sử dụng các phương pháp vật lý trị liệu và công nghệ hỗ trợ hiện đại.",
    thiet_bi: "Máy vật lý trị liệu, hồ bơi trị liệu, phòng tập chức năng hiện đại.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (8h00 - 16h30)",
  },
  {
    id_chuyen_khoa: 17,
    ten_chuyen_khoa: "KHOA CẤP CỨU TỔNG HỢP",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-capcuu.png",
    mo_ta: "Cung cấp dịch vụ cấp cứu 24/7 cho các trường hợp nguy kịch. Khoa được trang bị đội ngũ bác sĩ phản ứng nhanh và thiết bị cấp cứu hiện đại, đảm bảo xử lý kịp thời mọi tình huống.",
    thiet_bi: "Xe cứu thương hiện đại, máy sốc tim, phòng cấp cứu đa năng.",
    thoi_gian_hoat_dong: "24/7",
  },
  {
    id_chuyen_khoa: 18,
    ten_chuyen_khoa: "KHOA KHÁM BỆNH",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-kham.png",
    mo_ta: "Cung cấp dịch vụ khám sức khỏe tổng quát và chuyên sâu, giúp phát hiện sớm các vấn đề sức khỏe. Khoa có đội ngũ bác sĩ đa chuyên khoa và quy trình khám nhanh gọn, tiện lợi.",
    thiet_bi: "Hệ thống xét nghiệm tự động, máy siêu âm, phòng khám đa năng.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 19,
    ten_chuyen_khoa: "KHOA HỒI SỨC CẤP CỨU",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2022/10/icon-khoa-hoi-suc-cap-cuu-icu.png",
    mo_ta: "Chăm sóc đặc biệt cho bệnh nhân trong tình trạng nguy kịch, cần hỗ trợ sự sống. Khoa được trang bị các thiết bị hồi sức hiện đại và đội ngũ bác sĩ chuyên môn cao.",
    thiet_bi: "Máy thở hiện đại, hệ thống theo dõi bệnh nhân liên tục, phòng ICU vô trùng.",
    thoi_gian_hoat_dong: "24/7",
  },
  {
    id_chuyen_khoa: 20,
    ten_chuyen_khoa: "KHOA SẢN PHỤ KHOA",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-sanphukhoa.png",
    mo_ta: "Chăm sóc sức khỏe phụ nữ toàn diện, từ khám thai, sinh nở đến điều trị các bệnh lý phụ khoa. Khoa cung cấp dịch vụ cá nhân hóa với môi trường thân thiện và an toàn.",
    thiet_bi: "Máy siêu âm 4D, phòng sinh tiêu chuẩn quốc tế, hệ thống nội soi phụ khoa.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
  {
    id_chuyen_khoa: 21,
    ten_chuyen_khoa: "KHOA NGOẠI VÚ",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2022/12/icon-khoa-ngoai-vu-2023.png",
    mo_ta: "Chuyên chẩn đoán, điều trị và phẫu thuật các bệnh lý liên quan đến vú, bao gồm ung thư vú và các khối u lành tính. Khoa áp dụng kỹ thuật phẫu thuật hiện đại, đảm bảo thẩm mỹ và an toàn.",
    thiet_bi: "Máy chụp nhũ ảnh kỹ thuật số, phòng phẫu thuật vú chuyên biệt.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 22,
    ten_chuyen_khoa: "KHOA MIỄN DỊCH LÂM SÀNG",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2025/02/logo-mien-dich-lam-sang.png",
    mo_ta: "Chuyên nghiên cứu và điều trị các bệnh lý liên quan đến hệ miễn dịch, bao gồm dị ứng, tự miễn và suy giảm miễn dịch. Khoa cung cấp các xét nghiệm chuyên sâu và liệu pháp điều trị tiên tiến.",
    thiet_bi: "Máy xét nghiệm miễn dịch tự động, phòng thí nghiệm chuyên biệt.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 6 (8h00 - 16h30)",
  },
  {
    id_chuyen_khoa: 23,
    ten_chuyen_khoa: "KHOA TIẾT NIỆU",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/icon-tiet-nieu-nam-hoc-than-hoc.png",
    mo_ta: "Chuyên điều trị các bệnh lý tiết niệu và nam khoa như sỏi thận, viêm đường tiết niệu, rối loạn cương dương. Khoa sử dụng các kỹ thuật nội soi và phẫu thuật ít xâm lấn.",
    thiet_bi: "Máy nội soi tiết niệu, máy tán sỏi ngoài cơ thể, phòng phẫu thuật tiết niệu.",
    thoi_gian_hoat_dong: "Thứ 2 - Thứ 7 (7h30 - 16h30)",
  },
  {
    id_chuyen_khoa: 24,
    ten_chuyen_khoa: "KHOA NỘI TỔNG HỢP",
    hinh_anh: "https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa-noitonghop.png",
    mo_ta: "Cung cấp dịch vụ khám và điều trị các bệnh lý nội khoa tổng quát như cao huyết áp, bệnh gan, bệnh thận. Khoa có đội ngũ bác sĩ đa chuyên khoa, hỗ trợ chẩn đoán và điều trị toàn diện.",
    thiet_bi: "Máy siêu âm Doppler, hệ thống xét nghiệm máu hiện đại, phòng khám nội khoa.",
    thoi_gian_hoat_dong: "Thứ 2 - Chủ Nhật (7h00 - 17h00)",
  },
];

const Specialties = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const perPage = 12; // mỗi trang 12 khoa
  const totalPages = Math.ceil(specialtiesList.length / perPage);

  // Lấy data hiển thị cho trang hiện tại
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentSpecialties = specialtiesList.slice(indexOfFirst, indexOfLast);

  return (
    <div className="specialties-container py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-4 position-relative d-inline-block">
          Danh sách chuyên khoa
          <span className="underline"></span>
        </h2>

        {/* Grid chuyên khoa */}
        <div className="row g-4 justify-content-center">
          {currentSpecialties.map((s) => (
            <div key={s.id_chuyen_khoa} className="col-6 col-md-3">
              <div
                className="specialty-card text-center p-4 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedSpecialty(s)}
              >
                <img src={s.hinh_anh} alt={s.ten_chuyen_khoa} className="specialty-icon mb-3" />
                <h6 className="fw-bold">{s.ten_chuyen_khoa}</h6>
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
      </div>

      {/* Modal hiển thị chi tiết */}
      {selectedSpecialty && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedSpecialty.ten_chuyen_khoa}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSpecialty(null)}
                ></button>
              </div>
              <div className="modal-body text-start">
                <h6 className="fw-bold">Giới thiệu</h6>
                <p>{selectedSpecialty.mo_ta}</p>

                <h6 className="fw-bold mt-3">Cơ sở vật chất</h6>
                <p>{selectedSpecialty.thiet_bi}</p>

                <h6 className="fw-bold mt-3">Thời gian hoạt động</h6>
                <p>{selectedSpecialty.thoi_gian_hoat_dong}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedSpecialty(null)}
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

export default Specialties;
