import React from "react";

function Footer() {
  return (
    <footer className="footer text-light pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">
          {/* Giới thiệu */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase fw-bold">HOSPITAL CARE CENTER</h5>
            <p>
              Trung tâm Chăm sóc Bệnh viện cung cấp dịch vụ tư vấn, thăm khám và 
              chăm sóc sức khỏe toàn diện. Đội ngũ y bác sĩ giàu kinh nghiệm luôn 
              sẵn sàng hỗ trợ, mang đến sự an tâm và chất lượng cho bệnh nhân.
            </p>
          </div>

          {/* Liên kết */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase fw-bold">Liên kết</h5>
            <ul className="list-unstyled">
              <li><a href="#home" className="text-light text-decoration-none">Trang chủ</a></li>
              <li><a href="#dich-vu" className="text-light text-decoration-none">Dịch vụ</a></li>
              <li><a href="#gioi-thieu" className="text-light text-decoration-none">Giới thiệu</a></li>
              <li><a href="#lien-he" className="text-light text-decoration-none">Liên hệ</a></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase fw-bold">Liên hệ</h5>
            <p>Email: hospitalcarecenter@gmail.com</p>
            <p>Hotline: 1900 123 456</p>
            <p>Địa chỉ: 123 Nguyễn Văn Cừ, TP. Hồ Chí Minh</p>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="text-center border-top border-secondary pt-3">
          &copy; 2024 HOSPITAL CARE CENTER | All Rights Reserved
        </div>
      </div>
    </footer>
  );
}

export default Footer;
