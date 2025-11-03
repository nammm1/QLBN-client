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
import { ArrowLeftOutlined, FileTextOutlined, MedicineBoxOutlined, HeartOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "./MedicalRecords.css";
import apiHoSoKhamBenh from "../../api/HoSoKhamBenh";
import apiBenhNhan from "../../api/BenhNhan";
import apiNguoiDung from "../../api/NguoiDung";
import apiDonThuoc from "../../api/DonThuoc";

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
        const [benhNhanRes, hoSoRes] = await Promise.all([
          apiBenhNhan.getById(patientId).catch(() => null),
          apiHoSoKhamBenh.getByBenhNhan(patientId).catch(() => []),
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

        // Load danh sách hồ sơ khám bệnh
        const hoSoList = Array.isArray(hoSoRes) ? hoSoRes : (unwrap(hoSoRes) || []);
        
        const enrichedData = await Promise.all(
          hoSoList.map(async (hoSo) => {
            const id_ho_so = hoSo.id_ho_so || hoSo.id;
            
            // Lấy tên bác sĩ
            let ten_bac_si = "—";
            const bsId = hoSo.id_bac_si_tao || hoSo.id_bac_si;
            if (bsId) {
              try {
                const bsRes = await apiNguoiDung.getUserById(bsId);
                const bsData = unwrap(bsRes);
                ten_bac_si = bsData?.ho_ten ? `BS. ${bsData.ho_ten}` : "—";
              } catch {}
            }

            return {
              id_ho_so,
              thoi_gian_tao: hoSo.thoi_gian_tao || hoSo.ngay_tao || "—",
              bac_si: ten_bac_si,
              ly_do_kham: hoSo.ly_do_kham || "—",
              chuan_doan: hoSo.chuan_doan || hoSo.chan_doan || "—",
              ket_qua_cls: hoSo.ket_qua_cls || hoSo.ket_qua_can_lam_sang || "—",
              tham_do_chuc_nang: hoSo.tham_do_chuc_nang || "—",
              dieu_tri: hoSo.dieu_tri || "—",
              cham_soc: hoSo.cham_soc || "—",
              ghi_chu: hoSo.ghi_chu || "—",
              don_thuoc: [],
            };
          })
        );

        setMedicalData(enrichedData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Load đơn thuốc khi mở modal
  useEffect(() => {
    if (selectedMedical?.id_ho_so && modalVisible) {
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
              style={{ border: "1px solid #e6f7ff" }}
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
        </div>
      )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
