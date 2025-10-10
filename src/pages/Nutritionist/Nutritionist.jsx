import React, { useState, useEffect } from "react";
import "./Nutritionist.css";
import apiChuyenGia from "../../api/ChuyenGiaDinhDuong";
import apiNguoiDung from "../../api/NguoiDung";

const Nutritionist = () => {
  const [nutritionists, setNutritionists] = useState([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const nutritionistsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiChuyenGia.getAll();
        const chuyenGiaList = res.data; // backend trả { success, data }

        const mergedData = await Promise.all(
          chuyenGiaList.map(async (cg) => {
            try {
              // gọi thêm thông tin user bằng id_chuyen_gia
              const userRes = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
              const user = userRes.data;
              return { ...cg, ...user };
            } catch (err) {
              console.error("Lỗi lấy user:", err);
              return cg;
            }
          })
        );

        setNutritionists(mergedData);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách chuyên gia:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination
  const indexOfLast = currentPage * nutritionistsPerPage;
  const indexOfFirst = indexOfLast - nutritionistsPerPage;
  const currentNutritionists = nutritionists.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(nutritionists.length / nutritionistsPerPage);

  if (loading) {
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  }

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
      {selectedNutritionist && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {selectedNutritionist.ho_ten}
                </h5>
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
                  style={{
                    width: "150px",
                    height: "180px",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p>
                    <strong>Chức danh:</strong> {selectedNutritionist.hoc_vi}
                  </p>
                  <p>
                    <strong>Chuyên ngành:</strong>{" "}
                    {selectedNutritionist.linh_vuc_chuyen_sau}
                  </p>
                  <p>
                    <strong>Chức vụ:</strong> {selectedNutritionist.chuc_vu}
                  </p>
                  <p>
                    <strong>Giới thiệu:</strong>{" "}
                    {selectedNutritionist.gioi_thieu_ban_than}
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
