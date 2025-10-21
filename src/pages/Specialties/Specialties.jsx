import React, { useState, useEffect } from "react";
import "./Specialties.css";
import apiChuyenKhoa from "../../api/ChuyenKhoa";

// Danh sách chuyên khoa 


const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);

  const perPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiChuyenKhoa.getAllChuyenKhoa();
        console.log(data);
        setSpecialties(data); 
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(specialties.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentSpecialties = specialties.slice(indexOfFirst, indexOfLast);


  return (
    <div className="specialties-container py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-4 position-relative d-inline-block">
          Danh sách chuyên khoa
          <span className="underline"></span>
        </h2>

<div className="row justify-content-left">
  {currentSpecialties.map((s) => (
    <div key={s.id_chuyen_khoa} className="col-6 col-md-3 mb-4">
      <div
        className="specialty-card text-center p-4 shadow-sm"
        style={{ cursor: "pointer" }}
        onClick={() => setSelectedSpecialty(s)}
      >
        <img
          src={s.hinh_anh}
          alt={s.ten_chuyen_khoa}
          className="specialty-icon mb-3"
        />
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
