import React, { useState, useEffect } from "react";
import "./Doctors.css";
import apiBacSi from "../../api/BacSi";
import apiNguoiDung from "../../api/NguoiDung";

const Doctors = () => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const doctorsPerPage = 8;

  useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await apiBacSi.getAll();
      const bacSiList = res.data; // vì backend trả về { success, data }

      const mergedData = await Promise.all(
        bacSiList.map(async (bs) => {
          try {
            // dùng id_bac_si để gọi sang API người dùng
            const userRes = await apiNguoiDung.getUserById(bs.id_bac_si);
            const user = userRes.data;
            return { ...bs, ...user }; 
          } catch (err) {
            console.error("Lỗi lấy user:", err);
            return bs;
          }
        })
      );

      setDoctorsList(mergedData);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDoctors();
}, []);


  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctorsList.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(doctorsList.length / doctorsPerPage);

  if (loading) {
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container doctors-container">
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
      {totalPages > 1 && (
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
      )}

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
                    <strong>Giới thiệu:</strong>{" "}
                    {selectedDoctor.gioi_thieu_ban_than}
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
