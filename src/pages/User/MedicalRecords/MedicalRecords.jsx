import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Typography,
  Modal,
  Row,
  Col,
  Tag,
  Space,
  Descriptions,
  Divider,
  Collapse,
  Empty,
  Spin
} from "antd";
import { ArrowLeftOutlined, FileTextOutlined, MedicineBoxOutlined, HeartOutlined, CheckCircleOutlined, ExperimentOutlined, ShoppingOutlined } from "@ant-design/icons";
import "./MedicalRecords.css";
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan";
import apiNguoiDung from "../../../api/NguoiDung";
import apiDonThuoc from "../../../api/DonThuoc";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

const unwrap = (res) => {
  if (res?.data !== undefined) return res.data;
  return res ?? null;
};

const MedicalRecords = () => {
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [showPrescription, setShowPrescription] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [medicalData, setMedicalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const patientId =
    userInfo?.user?.id_benh_nhan ||
    userInfo?.user?.id_nguoi_dung ||
    null;

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        // Load thông tin bệnh nhân
        const [benhNhanRes, lichSuKhamRes] = await Promise.all([
          apiBenhNhan.getById(patientId).catch(() => null),
          apiCuocHenKhamBenh.getLichSuByBenhNhan(patientId).catch(() => []),
        ]);

        const benhNhan = unwrap(benhNhanRes);
        if (benhNhan) {
          const userInfoData = await apiNguoiDung.getUserById(patientId).catch(() => ({}));
          const userData = unwrap(userInfoData) || {};
          
          setPersonalInfo({
            ho_ten: benhNhan.ho_ten || userData.ho_ten || "—",
            gioi_tinh: benhNhan.gioi_tinh || userData.gioi_tinh || "—",
            ngay_sinh: benhNhan.ngay_sinh || userData.ngay_sinh || "—",
            tuoi: benhNhan.tuoi || "—",
            dan_toc: benhNhan.dan_toc || userData.dan_toc || "—",
            so_dien_thoai: benhNhan.so_dien_thoai || userData.so_dien_thoai || "—",
            dia_chi: benhNhan.dia_chi || userData.dia_chi || "—",
            doi_tuong: benhNhan.doi_tuong || "—",
            ma_BHYT: benhNhan.ma_BHYT || "—",
          });
        }

        // Load danh sách lịch sử khám bệnh (đã có đầy đủ thông tin)
        let lichSuList = [];
        if (Array.isArray(lichSuKhamRes)) {
          lichSuList = lichSuKhamRes;
        } else if (lichSuKhamRes) {
          const unwrapped = unwrap(lichSuKhamRes);
          if (Array.isArray(unwrapped)) {
            lichSuList = unwrapped;
          } else if (unwrapped && typeof unwrapped === 'object') {
            lichSuList = [unwrapped];
          }
        }
        
        // Đảm bảo lichSuList là array trước khi map
        if (!Array.isArray(lichSuList)) {
          console.warn("lichSuList không phải là array:", lichSuList);
          lichSuList = [];
        }
        
        const enrichedData = lichSuList.map((lichSu) => {
          const hoSo = lichSu.hoSo || {};
          const id_ho_so = hoSo.id_ho_so || lichSu.id_cuoc_hen;
          
          // Lấy tên bác sĩ
          let ten_bac_si = "—";
          if (lichSu.bacSi) {
            try {
              ten_bac_si = `BS. ${lichSu.bacSi.ho_ten || ""}`.trim() || "—";
            } catch {}
          } else {
            const bsId = hoSo.id_bac_si_tao || hoSo.id_bac_si;
            if (bsId) {
              // Fallback: lấy từ hồ sơ nếu không có trong lichSu
              // (sẽ được load sau nếu cần)
            }
          }

          // Lấy đơn thuốc với chi tiết
          let donThuocList = [];
          if (lichSu.chiTietDonThuoc && Array.isArray(lichSu.chiTietDonThuoc)) {
            donThuocList = lichSu.chiTietDonThuoc.map(ct => ({
              ten_thuoc: ct.ten_thuoc || ct.thuoc?.ten_thuoc || "—",
              lieu_dung: ct.lieu_dung || ct.cach_dung || "—",
              so_luong: ct.so_luong ? `${ct.so_luong} ${ct.don_vi || ""}`.trim() : "—",
            }));
          }

          return {
            id_ho_so,
            id_cuoc_hen: lichSu.id_cuoc_hen,
            thoi_gian_tao: hoSo.thoi_gian_tao || hoSo.ngay_tao || lichSu.ngay_kham || "—",
            bac_si: ten_bac_si,
            ly_do_kham: hoSo.ly_do_kham || "—",
            chuan_doan: hoSo.chuan_doan || hoSo.chan_doan || "—",
            ket_qua_cls: hoSo.ket_qua_cls || hoSo.ket_qua_can_lam_sang || "—",
            tham_do_chuc_nang: hoSo.tham_do_chuc_nang || "—",
            dieu_tri: hoSo.dieu_tri || "—",
            cham_soc: hoSo.cham_soc || "—",
            ghi_chu: hoSo.ghi_chu || "—",
            don_thuoc: donThuocList,
            chi_dinh_xet_nghiem: lichSu.chiDinhXetNghiem || [],
            chi_tiet_hoa_don: lichSu.chiTietHoaDon || [],
          };
        });

        setMedicalData(enrichedData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Load đơn thuốc khi mở modal (nếu chưa có trong dữ liệu)
  useEffect(() => {
    if (selectedMedical?.id_ho_so && modalVisible && (!selectedMedical.don_thuoc || selectedMedical.don_thuoc.length === 0)) {
      setPrescriptionLoading(true);
      apiDonThuoc.getByHoSo(selectedMedical.id_ho_so)
        .then((res) => {
          const donThuocData = unwrap(res);
          if (donThuocData && donThuocData.chi_tiet_don_thuoc) {
            const chiTiet = Array.isArray(donThuocData.chi_tiet_don_thuoc)
              ? donThuocData.chi_tiet_don_thuoc
              : [donThuocData.chi_tiet_don_thuoc];
            
            setSelectedMedical(prev => ({
              ...prev,
              don_thuoc: chiTiet.map(ct => ({
                ten_thuoc: ct.ten_thuoc || ct.thuoc?.ten_thuoc || "—",
                lieu_dung: ct.lieu_dung || ct.cach_dung || "—",
                so_luong: ct.so_luong ? `${ct.so_luong} ${ct.don_vi || ""}`.trim() : "—",
              })),
            }));
          }
        })
        .catch((err) => {
          console.error("Lỗi load đơn thuốc:", err);
        })
        .finally(() => {
          setPrescriptionLoading(false);
        });
    } else {
      setPrescriptionLoading(false);
    }
  }, [selectedMedical?.id_ho_so, modalVisible]);

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      width: 120,
      render: (text) => formatDate(text),
    },
    {
      title: "Bác sĩ",
      dataIndex: "bac_si",
      key: "bac_si",
      width: 150,
    },
    {
      title: "Lý do khám",
      dataIndex: "ly_do_kham",
      key: "ly_do_kham",
      width: 150,
    },
    {
      title: "Chẩn đoán",
      dataIndex: "chuan_doan",
      key: "chuan_doan",
      render: (text) => <Tag color="red">{text}</Tag>,
      width: 150,
    },
  ];

  const handleRowClick = (record) => {
    setSelectedMedical(record);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <Space align="center" style={{ marginBottom: 32, width: "100%" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/patient-function")}
            style={{ background: "#096dd9", color: "white", border: "none" }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ color: "#096dd9", margin: 0, flex: 1, textAlign: "center" }}>
            HỒ SƠ BỆNH ÁN
          </Title>
          <div style={{ width: 100 }}></div>
        </Space>

        {/* Thông tin cá nhân */}
        {personalInfo && (
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #e6f7ff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: 32,
            }}
          >
            <Title level={4} style={{ color: "#096dd9", marginBottom: 24 }}>
              <HeartOutlined /> Thông tin bệnh nhân
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Họ tên">{personalInfo.ho_ten}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{personalInfo.gioi_tinh}</Descriptions.Item>
              <Descriptions.Item label="Năm sinh">{formatDate(personalInfo.ngay_sinh)}</Descriptions.Item>
              <Descriptions.Item label="Tuổi">{personalInfo.tuoi}</Descriptions.Item>
              <Descriptions.Item label="Dân tộc">{personalInfo.dan_toc}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{personalInfo.so_dien_thoai}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{personalInfo.dia_chi}</Descriptions.Item>
              <Descriptions.Item label="Đối tượng">
                <Tag color="blue">{personalInfo.doi_tuong}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã BHYT">
                <Tag color="green">{personalInfo.ma_BHYT}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Lịch sử khám bệnh */}
        <Card
                  style={{
            borderRadius: 12,
            border: "1px solid #e6f7ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Title level={4} style={{ color: "#096dd9", marginBottom: 24 }}>
            <FileTextOutlined /> Lịch sử khám bệnh
          </Title>
          {medicalData.length === 0 ? (
            <Empty description="Không có lịch sử khám bệnh" />
          ) : (
            <Table
              columns={columns}
              dataSource={medicalData}
              rowKey={(record) => record.id_ho_so || record.thoi_gian_tao}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: "pointer" },
              })}
              pagination={false}
              style={{ background: "#fff" }}
            />
          )}
        </Card>
      </div>

      {/* Modal chi tiết */}
      <Modal
        title={
          <Title level={3} style={{ color: "#096dd9", margin: 0 }}>
            <MedicineBoxOutlined /> Chi tiết khám bệnh - {selectedMedical?.thoi_gian_tao}
          </Title>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMedical(null);
        }}
        footer={null}
        width={900}
      >
      {selectedMedical && (
          <div style={{ padding: "20px 0" }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title="Thông tin khám"
                  size="small"
                  style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày khám">{selectedMedical.thoi_gian_tao}</Descriptions.Item>
                    <Descriptions.Item label="Bác sĩ">{selectedMedical.bac_si}</Descriptions.Item>
                    <Descriptions.Item label="Lý do khám">{selectedMedical.ly_do_kham}</Descriptions.Item>
                    <Descriptions.Item label="Chẩn đoán">
                      <Tag color="red">{selectedMedical.chuan_doan}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Kết quả cận lâm sàng"
                  size="small"
                  style={{ border: "1px solid #91d5ff", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.ket_qua_cls}</Paragraph>
                </Card>

                <Card
                  title="Thăm dò chức năng"
                  size="small"
                  style={{ border: "1px solid #91d5ff" }}
                >
                  <Paragraph>{selectedMedical.tham_do_chuc_nang}</Paragraph>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Điều trị"
                  size="small"
                  style={{ border: "1px solid #b7eb8f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.dieu_tri}</Paragraph>
                </Card>

                <Card
                  title="Chăm sóc"
                  size="small"
                  style={{ border: "1px solid #ffe58f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.cham_soc}</Paragraph>
                </Card>

                <Card
                  title="Ghi chú"
                  size="small"
                  style={{ border: "1px solid #ffccc7" }}
                >
                  <Paragraph>{selectedMedical.ghi_chu}</Paragraph>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card
              title={
                <Space>
                  <MedicineBoxOutlined />
                  <span>Đơn thuốc</span>
                  <Button
                    size="small"
                    type="link"
                  onClick={() => setShowPrescription(!showPrescription)}
                    style={{ color: "#096dd9" }}
                >
                  {showPrescription ? "Ẩn đơn thuốc" : "Hiện đơn thuốc"}
                  </Button>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
            >
              {prescriptionLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Spin />
              </div>
              ) : showPrescription && (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {selectedMedical.don_thuoc && selectedMedical.don_thuoc.length > 0 ? (
                    selectedMedical.don_thuoc.map((thuoc, idx) => (
                      <Card
                        key={idx}
                        size="small"
                        style={{
                          background: "#f0f9ff",
                          border: "1px solid #91d5ff",
                        }}
                      >
                        <Text strong style={{ color: "#096dd9", fontSize: 16 }}>
                          {thuoc.ten_thuoc}
                        </Text>
                        <br />
                        <Text>Liều dùng: {thuoc.lieu_dung}</Text>
                        <br />
                        <Text>Số lượng: {thuoc.so_luong}</Text>
                      </Card>
                    ))
                  ) : (
                    <Empty description="Không có đơn thuốc" />
                  )}
                </Space>
              )}
            </Card>

            {/* Chỉ định xét nghiệm */}
            <Card
              title={
                <Space>
                  <ExperimentOutlined />
                  <span>Chỉ định xét nghiệm</span>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {selectedMedical.chi_dinh_xet_nghiem && selectedMedical.chi_dinh_xet_nghiem.length > 0 ? (
                  selectedMedical.chi_dinh_xet_nghiem.map((chiDinh, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        background: "#fff7e6",
                        border: "1px solid #ffd591",
                      }}
                    >
                      <Text strong style={{ color: "#d46b08", fontSize: 16 }}>
                        {chiDinh.ten_dich_vu || "—"}
                      </Text>
                      {chiDinh.yeu_cau_ghi_chu && (
                        <>
                          <br />
                          <Text>Yêu cầu/Ghi chú: {chiDinh.yeu_cau_ghi_chu}</Text>
                        </>
                      )}
                      {chiDinh.trang_thai && (
                        <>
                          <br />
                          <Tag color={
                            chiDinh.trang_thai === "hoan_thanh" ? "green" :
                            chiDinh.trang_thai === "cho_xu_ly" ? "orange" :
                            "red"
                          }>
                            {chiDinh.trang_thai === "hoan_thanh" ? "Hoàn thành" :
                             chiDinh.trang_thai === "cho_xu_ly" ? "Chờ xử lý" :
                             "Đã hủy"}
                          </Tag>
                        </>
                      )}
                      {chiDinh.ket_qua && (
                        <>
                          <br />
                          <Text type="success">Kết quả: {chiDinh.ket_qua.ket_qua || "—"}</Text>
                        </>
                      )}
                    </Card>
                  ))
                ) : (
                  <Empty description="Không có chỉ định xét nghiệm" />
                )}
              </Space>
            </Card>

            {/* Dịch vụ */}
            <Card
              title={
                <Space>
                  <ShoppingOutlined />
                  <span>Dịch vụ đã sử dụng</span>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff" }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {selectedMedical.chi_tiet_hoa_don && selectedMedical.chi_tiet_hoa_don.length > 0 ? (
                  selectedMedical.chi_tiet_hoa_don.map((dichVu, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                      }}
                    >
                      <Text strong style={{ color: "#389e0d", fontSize: 16 }}>
                        {dichVu.ten_dich_vu || "—"}
                      </Text>
                      {dichVu.so_luong && (
                        <>
                          <br />
                          <Text>Số lượng: {dichVu.so_luong}</Text>
                        </>
                      )}
                      {dichVu.don_gia && (
                        <>
                          <br />
                          <Text>Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dichVu.don_gia)}</Text>
                        </>
                      )}
                      {dichVu.thanh_tien && (
                        <>
                          <br />
                          <Text strong>Thành tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dichVu.thanh_tien)}</Text>
                        </>
                      )}
                    </Card>
                  ))
                ) : (
                  <Empty description="Không có dịch vụ" />
                )}
              </Space>
            </Card>
        </div>
      )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
