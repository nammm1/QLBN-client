// src/pages/Home/Home.jsx
import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import banner1 from "../../images/banner1.jpg";
import banner2 from "../../images/banner2.jpg";
import doctorImg from "../../images/doctor.jpg";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import "@glidejs/glide/dist/css/glide.theme.min.css";
import partner1 from "../../images/partner1.webp";
import partner2 from "../../images/partner2.webp";
import partner3 from "../../images/partner3.webp";
import partner4 from "../../images/partner4.webp";
import partner5 from "../../images/partner5.webp";
import partner6 from "../../images/partner6.webp";
import partner7 from "../../images/partner7.webp";

const partners = [partner1, partner2, partner3, partner4, partner5, partner6, partner7];


const Home = () => {
  const glideRef = useRef(null);

  useEffect(() => {
    // mount Glide on element with class .partners-glide
    glideRef.current = new Glide(".partners-glide", {
      type: "carousel",
      perView: 3,                 // hiển thị 3 item cùng lúc (bạn có thể đổi)
      gap: 30,                    // khoảng cách giữa các item (px)
      autoplay: 2000,             // tự động chuyển sau 2s
      hoverpause: true,           // dừng khi hover
      animationDuration: 400,     // duration chuyển (ms)
      animationTimingFunc: "cubic-bezier(0.165, 0.84, 0.44, 1)",
      breakpoints: {
        992: { perView: 2 },      // tablet
        576: { perView: 1 }       // mobile
      }
    });

    glideRef.current.mount();
    return () => {
      if (glideRef.current) glideRef.current.destroy();
    };
  }, []);

  return (
    <div className="home-container">
      {/* Banner Carousel */}
<div 
  id="homeCarousel" 
  className="carousel slide position-relative" 
  data-bs-ride="carousel" 
  data-bs-interval="2000"
>
  {/* Slogan cố định */}
  <div 
    className="banner-slogan position-absolute top-50 start-50 translate-middle text-center text-white"
    style={{ zIndex: 20 }}
  >
    <h1 className="fw-bold display-4">Sức khỏe của bạn – Sứ mệnh của chúng tôi</h1>
    <p className="lead">Chăm sóc tận tâm, dịch vụ chuyên nghiệp</p>
  </div>

  {/* Carousel images */}
  <div className="carousel-inner">
    <div className="carousel-item active">
      <div className="banner-overlay">
        <img src={banner1} className="d-block w-100" alt="Banner 1" />
      </div>
    </div>
    <div className="carousel-item">
      <div className="banner-overlay">
        <img src={banner2} className="d-block w-100" alt="Banner 2" />
      </div>
    </div>
  </div>

  {/* Controls */}
  <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
</div>

      {/* Why choose us */}
      <div className="container mt-5 why-choose-us">
        <h2 className="fw-bold mb-4 position-relative custom-heading">
          Vì sao nên chọn bệnh viện chúng tôi?
        </h2>
        <div className="row align-items-center">
          {/* Bác sĩ bên trái */}
          <div className="col-md-5 text-center">
            <img src={doctorImg} alt="Doctor" className="img-fluid about-doctor" />
          </div>

          {/* 4 card bên phải */}
          <div className="col-md-7">
            <div className="row g-4">
              {[
                { icon: "❤️", title: "Chăm sóc tận tâm", text: "Đội ngũ y bác sĩ luôn đặt bệnh nhân làm trung tâm" },
                { icon: "🧪", title: "Trang thiết bị hiện đại", text: "Ứng dụng công nghệ và máy móc tiên tiến trong chẩn đoán, điều trị" },
                { icon: "⏱️", title: "Phục vụ nhanh chóng", text: "Quy trình khám chữa bệnh tối ưu, giảm thiểu thời gian chờ đợi" },
                { icon: "🌍", title: "Uy tín & chất lượng", text: "Được hàng ngàn bệnh nhân trong và ngoài nước tin tưởng" }
              ].map((card, i) => (
                <div className="col-md-6" key={i}>
                  <div className="card h-100 border-primary text-center p-3">
                    <div className="card-body">
                      <div className="mb-2">
                        <span style={{ fontSize: "2rem", color: "#00B5F1" }}>{card.icon}</span>
                      </div>
                      <h5 className="card-title">{card.title}</h5>
                      <p className="card-text">{card.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Các thành tựu nổi bật */}
      <section className="py-5 text-white achievements" style={{ background: "linear-gradient(90deg, #00B5F1, #00D8F1)" }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Các thành tựu nổi bật</h2>
          <p className="mb-5">Những con số ấn tượng thể hiện chất lượng dịch vụ của chúng tôi</p>
          <div className="row">
            <div className="col-md-3">
              <h3 className="fw-bold">50,000+</h3>
              <p>Bệnh nhân tin tưởng điều trị</p>
            </div>
            <div className="col-md-3">
              <h3 className="fw-bold">200+</h3>
              <p>Bác sĩ chuyên khoa</p>
            </div>
            <div className="col-md-3">
              <h3 className="fw-bold">15</h3>
              <p>Năm kinh nghiệm</p>
            </div>
            <div className="col-md-3">
              <h3 className="fw-bold">98%</h3>
              <p>Bệnh nhân hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Các đối tác - Glide.js */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4 position-relative d-inline-block">
            Các đối tác của chúng tôi
            <span style={{ display: "block", width: "80px", height: "4px", background: "#00B5F1", margin: "8px auto 0", borderRadius: "2px" }} />
          </h2>

          <div className="partners-glide glide">
            <div className="glide__track" data-glide-el="track">
              <ul className="glide__slides">
                {partners.map((src, idx) => (
                  <li className="glide__slide" key={idx}>
                    <figure className="item hospital_slide">
                      <img loading="lazy" src={src} alt={`partner${idx + 1}`} />
                    </figure>
                  </li>
                ))}

              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bản đồ */}
      <section className="bg-light">
        <div className=" text-center">
          <h2 className="fw-bold mb-3">Bản đồ</h2>
          <p className="mb-4">Nguyễn Văn Bảo/12 Đ. Hạnh Thông, Phường, Gò Vấp, Hồ Chí Minh 700000, Việt Nam</p>
          <div style={{ width: "100%", height: "560px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1959.428585080572!2d106.68555793611127!3d10.82224055898329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1758710417162!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
