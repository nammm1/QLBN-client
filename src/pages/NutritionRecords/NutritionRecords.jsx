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
  Empty,
  Collapse,
  Spin,
} from "antd";
import { ArrowLeftOutlined, AppleOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import "./NutritionRecords.css";
import apiHoSoDinhDuong from "../../api/HoSoDinhDuong";
import apiBenhNhan from "../../api/BenhNhan";
import apiNguoiDung from "../../api/NguoiDung";

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

const NutritionRecords = () => {
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const benhNhanRes = await apiBenhNhan.getById(patientId).catch(() => null);
        const benhNhan = unwrap(benhNhanRes);
        
        if (benhNhan) {
          const userInfoData = await apiNguoiDung.getUserById(patientId).catch(() => ({}));
          const userData = unwrap(userInfoData) || {};
          
          setPersonalInfo({
            ho_ten: benhNhan.ho_ten || userData.ho_ten || "—",
            gioi_tinh: benhNhan.gioi_tinh || userData.gioi_tinh || "—",
            tuoi: benhNhan.tuoi || "—",
            dan_toc: benhNhan.dan_toc || userData.dan_toc || "—",
            so_dien_thoai: benhNhan.so_dien_thoai || userData.so_dien_thoai || "—",
            dia_chi: benhNhan.dia_chi || userData.dia_chi || "—",
          });
        }

        // Load danh sách hồ sơ dinh dưỡng
        const hoSoRes = await apiHoSoDinhDuong.getByBenhNhan(patientId).catch(() => []);
        const hoSoList = Array.isArray(hoSoRes) ? hoSoRes : (unwrap(hoSoRes) || []);
        
        const enrichedData = await Promise.all(
          hoSoList.map(async (hoSo) => {
            // Lấy tên chuyên gia
            let ten_chuyen_gia = "—";
            const cgId = hoSo.id_chuyen_gia;
            if (cgId) {
              try {
                const cgRes = await apiNguoiDung.getUserById(cgId);
                const cgData = unwrap(cgRes);
                ten_chuyen_gia = cgData?.ho_ten ? cgData.ho_ten : "—";
              } catch {}
            }

            return {
              id_ho_so: hoSo.id_ho_so || hoSo.id,
              ngay_tao: hoSo.ngay_tao || "—",
              chuyen_gia: ten_chuyen_gia,
              loai_tu_van: hoSo.loai_tu_van || hoSo.loai_dinh_duong || "—",
              phuong_thuc: hoSo.phuong_thuc || hoSo.loai_hen === "truc_tiep" ? "Trực tiếp" : (hoSo.loai_hen === "online" ? "Online" : "—"),
              chi_so: {
                chieu_cao: hoSo.chieu_cao ? `${hoSo.chieu_cao} cm` : "—",
                can_nang: hoSo.can_nang ? `${hoSo.can_nang} kg` : "—",
                vong_eo: hoSo.vong_eo ? `${hoSo.vong_eo} cm` : "—",
                mo_co_the: hoSo.mo_co_the ? `${hoSo.mo_co_the}%` : "—",
                khoi_co: hoSo.khoi_co ? `${hoSo.khoi_co} kg` : "—",
                nuoc_trong_co_the: hoSo.nuoc_trong_co_the ? `${hoSo.nuoc_trong_co_the}%` : "—",
              },
              nhan_xet: hoSo.nhan_xet || "—",
              ke_hoach_dinh_duong: hoSo.ke_hoach_dinh_duong || "—",
              nhu_cau_calo: hoSo.nhu_cau_calo ? `${hoSo.nhu_cau_calo} kcal/ngày` : "—",
              cham_soc: hoSo.cham_soc || "—",
              ghi_chu: hoSo.ghi_chu || "—",
              thuc_don: hoSo.thuc_don || {},
            };
          })
        );

        setNutritionData(enrichedData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const columns = [
    {
      title: "Ngày tư vấn",
      dataIndex: "ngay_tao",
      key: "ngay_tao",
      width: 120,
      render: (text) => formatDate(text),
    },
    {
      title: "Chuyên gia",
      dataIndex: "chuyen_gia",
      key: "chuyen_gia",
      width: 180,
    },
    {
      title: "Loại tư vấn",
      dataIndex: "loai_tu_van",
      key: "loai_tu_van",
      render: (text) => (
        <Tag color={text === "Giảm cân" ? "red" : "blue"}>{text}</Tag>
      ),
      width: 120,
    },
    {
      title: "Phương thức",
      dataIndex: "phuong_thuc",
      key: "phuong_thuc",
      render: (text) => (
        <Tag color={text === "Trực tiếp" ? "green" : "cyan"}>{text}</Tag>
      ),
      width: 120,
    },
  ];

  const handleRowClick = (record) => {
    setSelectedNutrition(record);
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
            style={{ background: "#52c41a", color: "white", border: "none" }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ color: "#52c41a", margin: 0, flex: 1, textAlign: "center" }}>
            HỒ SƠ DINH DƯỠNG
          </Title>
          <div style={{ width: 100 }}></div>
        </Space>

        {/* Thông tin cá nhân */}
        {personalInfo && (
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #d9f7be",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: 32,
            }}
          >
            <Title level={4} style={{ color: "#52c41a", marginBottom: 24 }}>
              <UserOutlined /> Thông tin cá nhân
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Họ tên">{personalInfo.ho_ten}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{personalInfo.gioi_tinh}</Descriptions.Item>
              <Descriptions.Item label="Tuổi">{personalInfo.tuoi}</Descriptions.Item>
              <Descriptions.Item label="Dân tộc">{personalInfo.dan_toc}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{personalInfo.so_dien_thoai}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{personalInfo.dia_chi}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Lịch sử tư vấn dinh dưỡng */}
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #d9f7be",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Title level={4} style={{ color: "#52c41a", marginBottom: 24 }}>
            <AppleOutlined /> Lịch sử tư vấn dinh dưỡng
          </Title>
          {nutritionData.length === 0 ? (
            <Empty description="Không có lịch sử tư vấn dinh dưỡng" />
          ) : (
            <Table
              columns={columns}
              dataSource={nutritionData}
              rowKey={(record, index) => index}
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
          <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
            <AppleOutlined /> Chi tiết tư vấn dinh dưỡng - {selectedNutrition?.ngay_tao}
          </Title>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedNutrition(null);
        }}
        footer={null}
        width={900}
      >
        {selectedNutrition && (
          <div style={{ padding: "20px 0" }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title="Thông tin tư vấn"
                  size="small"
                  style={{ border: "1px solid #d9f7be", marginBottom: 16 }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày tư vấn">{selectedNutrition.ngay_tao}</Descriptions.Item>
                    <Descriptions.Item label="Chuyên gia">{selectedNutrition.chuyen_gia}</Descriptions.Item>
                    <Descriptions.Item label="Loại tư vấn">
                      <Tag color={selectedNutrition.loai_tu_van === "Giảm cân" ? "red" : "blue"}>
                        {selectedNutrition.loai_tu_van}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      <Tag color={selectedNutrition.phuong_thuc === "Trực tiếp" ? "green" : "cyan"}>
                        {selectedNutrition.phuong_thuc}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Các chỉ số dinh dưỡng/cơ thể"
                  size="small"
                  style={{ border: "1px solid #b7eb8f", marginBottom: 16 }}
                >
                  <Descriptions column={1} size="small">
                    {Object.entries(selectedNutrition.chi_so).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key.replace(/_/g, " ")}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </Card>

                <Card
                  title="Nhu cầu calo hàng ngày"
                  size="small"
                  style={{ border: "1px solid #ffe58f", textAlign: "center" }}
                >
                  <Text strong style={{ color: "#d46b08", fontSize: 18 }}>
                    {selectedNutrition.nhu_cau_calo}
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Nhận xét"
                  size="small"
                  style={{ border: "1px solid #ffe58f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedNutrition.nhan_xet}</Paragraph>
                </Card>

                <Card
                  title="Kế hoạch dinh dưỡng"
                  size="small"
                  style={{ border: "1px solid #b7eb8f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedNutrition.ke_hoach_dinh_duong}</Paragraph>
                </Card>

                <Card
                  title="Chăm sóc"
                  size="small"
                  style={{ border: "1px solid #ffccc7", marginBottom: 16 }}
                >
                  <Paragraph>{selectedNutrition.cham_soc}</Paragraph>
                </Card>

                <Card
                  title="Ghi chú"
                  size="small"
                  style={{ border: "1px solid #ffccc7" }}
                >
                  <Paragraph>{selectedNutrition.ghi_chu}</Paragraph>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card
              title={
                <Space>
                  <AppleOutlined />
                  <span>Thực đơn mẫu</span>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setShowMenu(!showMenu)}
                    style={{ color: "#52c41a" }}
                  >
                    {showMenu ? "Ẩn thực đơn" : "Xem thực đơn mẫu"}
                  </Button>
                </Space>
              }
              style={{ border: "1px solid #d9f7be" }}
            >
              {showMenu && (
                <Row gutter={[16, 16]}>
                  {Object.entries(selectedNutrition.thuc_don).map(([buoi, thucdon], idx) => (
                    <Col xs={24} sm={12} key={idx}>
                      <Card
                        size="small"
                        title={buoi}
                        style={{
                          background: idx % 2 === 0 ? "#f6ffed" : "#fff7e6",
                          border: "1px solid #d9f7be",
                        }}
                      >
                        <Text>{thucdon}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NutritionRecords;
