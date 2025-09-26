import React from "react";
import "./About.css";
import about1 from "../../images/about-img1.jpg";
import about2 from "../../images/about-img2.jpg";

const About = () => {
  return (
    <div className="about-container container">
      <div className="row align-items-center">
        {/* Bên trái */}
        <div className="col-md-6">
          <h2 className="about-title">Giới thiệu chung</h2>
          <p className="about-text">
            Bệnh viện chúng tôi là hệ thống y tế được xây dựng với sứ mệnh mang
            lại dịch vụ chăm sóc sức khỏe toàn diện, hiện đại và nhân văn. Chúng
            tôi hướng đến chuẩn mực y tế quốc tế, kết hợp giữa chuyên môn và sự
            tận tâm trong chăm sóc bệnh nhân.
          </p>

          <h2 className="about-title">Tầm nhìn</h2>
          <p className="about-text">
            Trở thành bệnh viện hàng đầu trong khu vực, nơi mang đến chất lượng
            điều trị xuất sắc, dịch vụ chăm sóc toàn diện và xây dựng niềm tin
            bền vững cho cộng đồng.
          </p>

          <h2 className="about-title">Sứ mệnh</h2>
          <p className="about-text">
            Chăm sóc sức khỏe bằng Tài năng, Y đức và Sự thấu cảm. Luôn đặt con
            người làm trung tâm trong mọi hoạt động.
          </p>
        </div>

        {/* Ảnh bên trái */}
        <div className="col-md-6 text-center">
          <img
            src={about1}
            alt="Giới thiệu"
            className="about-img"
          />
        </div>
      </div>

      <div className="row align-items-center flex-row-reverse">
        {/* Bên phải */}
        <div className="col-md-6">
          <h2 className="about-title">Giá trị cốt lõi – H.E.A.R.T</h2>
          <div className="core-values">
            <div>
              <h5>H – Humanity (Nhân văn)</h5>
              <p>
                Luôn đặt con người làm trung tâm, chăm sóc với tình thương và sự
                thấu hiểu.
              </p>
            </div>
            <div>
              <h5>E – Excellence (Xuất sắc)</h5>
              <p>
                Không ngừng nâng cao chất lượng dịch vụ và chuyên môn để mang lại
                kết quả tốt nhất.
              </p>
            </div>
            <div>
              <h5>A – Accountability (Trách nhiệm)</h5>
              <p>
                Chịu trách nhiệm cao nhất trong mọi hành động, vì lợi ích của
                bệnh nhân và cộng đồng.
              </p>
            </div>
            <div>
              <h5>R – Respect (Tôn trọng)</h5>
              <p>
                Tôn trọng người bệnh, đồng nghiệp và các giá trị đạo đức nghề
                nghiệp.
              </p>
            </div>
            <div>
              <h5>T – Trust (Tin cậy)</h5>
              <p>
                Xây dựng niềm tin vững chắc bằng sự minh bạch, tận tâm và uy tín.
              </p>
            </div>
          </div>
        </div>

        {/* Ảnh bên phải */}
        <div className="col-md-6 text-center">
          <img
            src={about2}
            alt="Giá trị cốt lõi"
            className="about-img"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
