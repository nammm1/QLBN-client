import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  List,
  Avatar,
  Descriptions,
  Space,
  Divider,
  Spin,
  Alert,
  Badge
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import apiHoSoDinhDuong from "../../../api/HoSoDinhDuong";
import apiBenhNhan from "../../../api/BenhNhan";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";

const { Title, Text } = Typography;

const NutritionistRecordDetail = () => {
  const { id_ho_so } = useParams();
  const navigate = useNavigate();

  const [hoSo, setHoSo] = useState(null);
  const [benhNhan, setBenhNhan] = useState(null);
  const [cuocHenList, setCuocHenList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hs = await apiHoSoDinhDuong.getById(id_ho_so);
        setHoSo(hs);

        if (hs?.id_benh_nhan) {
          const bn = await apiBenhNhan.getById(hs.id_benh_nhan);
          setBenhNhan(bn);

          const cuocHen = await apiCuocHenTuVan.getByBenhNhan(hs.id_benh_nhan);
          setCuocHenList(cuocHen || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_ho_so]);

  const handleViewAppointment = (id_cuoc_hen) => {
    navigate(`/nutritionist/appointment/${id_cuoc_hen}`);
  };

  const handleChat = () => {
    const id_nguoi_nhan = hoSo?.id_benh_nhan;
    if (id_nguoi_nhan) {
      navigate(`/nutritionist/chat?user=${id_nguoi_nhan}`);
    }
  };

  const getStatusColor = (status) => {
    return status === 'da_hoan_thanh' ? 'green' : 'orange';
  };

  const getStatusText = (status) => {
    return status === 'da_hoan_thanh' ? 'Đã hoàn thành' : 'Chưa hoàn thành';
  };

  const getGenderColor = (gender) => {
    return gender?.toLowerCase() === 'nam' ? 'blue' : 'pink';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải thông tin hồ sơ...</Text>
        </div>
      </div>
    );
  }

  if (!hoSo) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <Alert
          message="Không tìm thấy hồ sơ"
          description="Hồ sơ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Card className="shadow-sm" style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              style={{ padding: '4px 8px' }}
            >
              Quay lại
            </Button>
            <Divider type="vertical" style={{ height: 24 }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#096dd9' }}>
                🥗 Hồ sơ dinh dưỡng
              </Title>
              <Text type="secondary">Chi tiết thông tin hồ sơ và lịch sử tư vấn dinh dưỡng</Text>
            </div>
          </div>
          <Space>
            {hoSo?.id_benh_nhan && (
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={handleChat}
                style={{ borderRadius: 6 }}
              >
                Chat với bệnh nhân
              </Button>
            )}
            <Badge count={`Mã HS: ${hoSo.id_ho_so}`} style={{ backgroundColor: '#096dd9' }} />
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Thông tin hồ sơ dinh dưỡng */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#096dd9' }} />
                <span>Thông tin hồ sơ dinh dưỡng</span>
              </Space>
            }
            className="shadow-sm"
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={
                <Space>
                  <UserOutlined />
                  <span>Họ tên</span>
                </Space>
              }>
                <Text strong>{hoSo.ho_ten}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag color={getGenderColor(hoSo.gioi_tinh)}>
                  {hoSo.gioi_tinh}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                <Badge count={hoSo.tuoi} style={{ backgroundColor: '#faad14' }} />
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <PhoneOutlined />
                  <span>Số điện thoại</span>
                </Space>
              }>
                {hoSo.so_dien_thoai}
              </Descriptions.Item>
              <Descriptions.Item label="Dân tộc">
                {hoSo.dan_toc || <Text type="secondary">Không có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <IdcardOutlined />
                  <span>Mã BHYT</span>
                </Space>
              }>
                {hoSo.ma_BHYT || <Text type="secondary">Không có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <EnvironmentOutlined />
                  <span>Địa chỉ</span>
                </Space>
              }>
                {hoSo.dia_chi || <Text type="secondary">Không có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao (cm)">
                {hoSo.chieu_cao ? `${hoSo.chieu_cao} cm` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng (kg)">
                {hoSo.can_nang ? `${hoSo.can_nang} kg` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Vòng eo (cm)">
                {hoSo.vong_eo ? `${hoSo.vong_eo} cm` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Mỡ cơ thể (%)">
                {hoSo.mo_co_the ? `${hoSo.mo_co_the}%` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Khối cơ (kg)">
                {hoSo.khoi_co ? `${hoSo.khoi_co} kg` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Nước trong cơ thể (%)">
                {hoSo.nuoc_trong_co_the ? `${hoSo.nuoc_trong_co_the}%` : <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <CalendarOutlined />
                  <span>Ngày tạo</span>
                </Space>
              }>
                {hoSo.ngay_tao ? new Date(hoSo.ngay_tao).toLocaleDateString("vi-VN") : "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Thông tin bệnh nhân */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TeamOutlined style={{ color: '#1890ff' }} />
                <span>Thông tin bệnh nhân</span>
              </Space>
            }
            className="shadow-sm"
            style={{ borderRadius: 12, height: '100%' }}
          >
            {benhNhan ? (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã bệnh nhân">
                  <Text strong>{benhNhan?.id_benh_nhan || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày sinh</span>
                  </Space>
                }>
                  {benhNhan?.ngay_sinh ? new Date(benhNhan.ngay_sinh).toLocaleDateString("vi-VN") : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <UserOutlined />
                    <span>Giới tính</span>
                  </Space>
                }>
                  <Tag color={getGenderColor(benhNhan?.gioi_tinh)}>
                    {benhNhan?.gioi_tinh || 'N/A'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert
                message="Không có thông tin bệnh nhân"
                description="Không thể tải thông tin chi tiết của bệnh nhân"
                type="warning"
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Danh sách cuộc hẹn tư vấn */}
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                <span>Lịch sử cuộc hẹn tư vấn dinh dưỡng</span>
                <Badge count={cuocHenList.length} showZero style={{ backgroundColor: '#096dd9' }} />
              </Space>
            }
            className="shadow-sm"
            style={{ borderRadius: 12 }}
          >
            {cuocHenList.length > 0 ? (
              <List
                dataSource={cuocHenList}
                renderItem={(cuocHen) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleViewAppointment(cuocHen.id_cuoc_hen)}
                      >
                        Xem chi tiết
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<CalendarOutlined />} 
                          style={{ backgroundColor: getStatusColor(cuocHen.trang_thai) }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>
                            Ngày tư vấn: {cuocHen.ngay_tu_van ? new Date(cuocHen.ngay_tu_van).toLocaleDateString("vi-VN") : "Chưa có"}
                          </Text>
                          <Tag color={getStatusColor(cuocHen.trang_thai)}>
                            {getStatusText(cuocHen.trang_thai)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>
                            <strong>Lý do tư vấn:</strong> {cuocHen.ly_do_tu_van || "Không có"}
                          </Text>
                          {cuocHen.khung_gio && (
                            <Text type="secondary">
                              <ClockCircleOutlined /> {cuocHen.khung_gio.gio_bat_dau} - {cuocHen.khung_gio.gio_ket_thuc}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Chưa có cuộc hẹn tư vấn nào
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NutritionistRecordDetail;

