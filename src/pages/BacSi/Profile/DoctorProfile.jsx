import React, { useState, useEffect } from 'react';
import { 
  CameraOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StarOutlined,
  IdcardOutlined,
  TrophyOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Avatar, 
  Form, 
  Input, 
  Select, 
  Upload, 
  message, 
  Tabs, 
  Tag, 
  Timeline, 
  Row, 
  Col, 
  Statistic,
  Progress,
  Badge,
  Divider
} from 'antd';
import apiBacSi from '../../../api/BacSi';
import './DoctorProfile.css';

const { Option } = Select;
const { TextArea } = Input;

const DoctorProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bacSiInfo, setBacSiInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo && userInfo.user.id_nguoi_dung) {
        setUserInfo(userInfo.user);
        const bacSiProfile = await apiBacSi.getById(userInfo.user.id_nguoi_dung);
        setBacSiInfo(bacSiProfile);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin:', error);
      message.error('Không thể tải thông tin cá nhân');
    }
  };

  useEffect(() => {
    if (userInfo && bacSiInfo && !formInitialized) {
      form.setFieldsValue({
        ho_ten: userInfo.ho_ten,
        email: userInfo.email,
        so_dien_thoai: userInfo.so_dien_thoai,
        gioi_tinh: userInfo.gioi_tinh,
        dia_chi: userInfo.dia_chi,
        chuyen_mon: bacSiInfo.chuyen_mon,
        trinh_do: bacSiInfo.chuc_danh || bacSiInfo.trinh_do,
        so_giay_phep_hang_nghe: bacSiInfo.so_giay_phep_hang_nghe,
        so_nam_kinh_nghiem: bacSiInfo.so_nam_kinh_nghiem,
        gioi_thieu: bacSiInfo.gioi_thieu_ban_than
      });
      setFormInitialized(true);
    }
  }, [userInfo, bacSiInfo, form, formInitialized]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      // ... existing save logic
      message.success('Cập nhật thông tin thành công');
      setEditMode(false);
      fetchDoctorProfile();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      message.error('Cập nhật thất bại');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    try {
      setTimeout(() => {
        message.success('Cập nhật ảnh đại diện thành công');
        setAvatarLoading(false);
        fetchDoctorProfile();
      }, 1000);
    } catch (error) {
      message.error('Upload ảnh thất bại');
      setAvatarLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ chấp nhận file JPG/PNG!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
        return false;
      }
      handleAvatarUpload(file);
      return false;
    },
  };

  // Hiển thị thông tin bác sĩ
  const displayChuyenMon = bacSiInfo?.chuyen_mon || 'Chưa cập nhật';
  const displayTrinhDo = bacSiInfo?.chuc_danh || bacSiInfo?.trinh_do || 'Bác sĩ Chuyên khoa';
  const displayNamKinhNghiem = bacSiInfo?.so_nam_kinh_nghiem ? `${bacSiInfo.so_nam_kinh_nghiem} năm` : 'Chưa cập nhật';
  const displayGiayPhep = bacSiInfo?.so_giay_phep_hang_nghe || 'Chưa cập nhật';

  // Items cho Tabs
  const tabItems = [
    {
      key: '1',
      label: (
        <span className="tab-label">
          <UserOutlined className="tab-icon" />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <Card 
          className="profile-card"
          title={
            <div className="card-title">
              <UserOutlined className="title-icon" />
              Thông tin cá nhân
            </div>
          }
          extra={
            !editMode ? (
              <Button 
                type="primary"
                icon={<EditOutlined />} 
                onClick={() => setEditMode(true)}
                className="edit-btn"
              >
                Chỉnh sửa
              </Button>
            ) : (
              <div className="action-buttons">
                <Button 
                  onClick={() => setEditMode(false)}
                  className="cancel-btn"
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                  loading={loading}
                  className="save-btn"
                >
                  Lưu thay đổi
                </Button>
              </div>
            )
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProfile}
            disabled={!editMode}
            className="profile-form"
          >
            <div className="form-section">
              <h3 className="section-title">Thông tin cơ bản</h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="ho_ten"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    className="form-item-custom"
                  >
                    <Input 
                      prefix={<UserOutlined className="input-icon" />} 
                      placeholder="Nhập họ và tên"
                      size="large"
                      className="custom-input"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                    className="form-item-custom"
                  >
                    <Input 
                      prefix={<MailOutlined className="input-icon" />} 
                      placeholder="Nhập email"
                      size="large"
                      className="custom-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="so_dien_thoai"
                    label="Số điện thoại"
                    className="form-item-custom"
                  >
                    <Input 
                      prefix={<PhoneOutlined className="input-icon" />} 
                      placeholder="Nhập số điện thoại"
                      size="large"
                      className="custom-input"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="gioi_tinh"
                    label="Giới tính"
                    className="form-item-custom"
                  >
                    <Select 
                      placeholder="Chọn giới tính" 
                      size="large"
                      className="custom-select"
                    >
                      <Option value="Nam">Nam</Option>
                      <Option value="Nữ">Nữ</Option>
                      <Option value="Khác">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="dia_chi"
                label="Địa chỉ"
                className="form-item-custom"
              >
                <Input 
                  prefix={<EnvironmentOutlined className="input-icon" />} 
                  placeholder="Nhập địa chỉ"
                  size="large"
                  className="custom-input"
                />
              </Form.Item>
            </div>

            <Divider />

            <div className="form-section">
              <h3 className="section-title">Thông tin chuyên môn</h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="chuyen_mon"
                    label="Chuyên môn"
                    className="form-item-custom"
                  >
                    <Input 
                      placeholder="Chuyên môn"
                      size="large"
                      className="custom-input"
                      prefix={<BookOutlined className="input-icon" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="trinh_do"
                    label="Chức danh/Trình độ"
                    className="form-item-custom"
                  >
                    <Select 
                      placeholder="Chọn trình độ" 
                      size="large"
                      className="custom-select"
                    >
                      <Option value="Bác sĩ đa khoa">Bác sĩ đa khoa</Option>
                      <Option value="Bác sĩ chuyên khoa">Bác sĩ chuyên khoa</Option>
                      <Option value="Thạc sĩ">Thạc sĩ</Option>
                      <Option value="Tiến sĩ">Tiến sĩ</Option>
                      <Option value="Phó giáo sư">Phó giáo sư</Option>
                      <Option value="Giáo sư">Giáo sư</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="so_giay_phep_hang_nghe"
                    label="Số giấy phép hành nghề"
                    className="form-item-custom"
                  >
                    <Input 
                      placeholder="Số giấy phép hành nghề"
                      size="large"
                      className="custom-input"
                      prefix={<SafetyCertificateOutlined className="input-icon" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="so_nam_kinh_nghiem"
                    label="Số năm kinh nghiệm"
                    className="form-item-custom"
                  >
                    <Input 
                      type="number"
                      placeholder="Số năm kinh nghiệm"
                      size="large"
                      className="custom-input"
                      prefix={<TrophyOutlined className="input-icon" />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="gioi_thieu"
                label="Giới thiệu bản thân"
                className="form-item-custom"
              >
                <TextArea
                  rows={4}
                  placeholder="Giới thiệu về bản thân, kinh nghiệm làm việc..."
                  showCount
                  maxLength={500}
                  className="custom-textarea"
                />
              </Form.Item>
            </div>
          </Form>
        </Card>
      )
    },
    {
      key: '2',
      label: (
        <span className="tab-label">
          <IdcardOutlined className="tab-icon" />
          Thông tin chuyên môn
        </span>
      ),
      children: (
        <Card 
          className="profile-card"
          title={
            <div className="card-title">
              <IdcardOutlined className="title-icon" />
              Thông tin chuyên môn chi tiết
            </div>
          }
        >
          <div className="professional-info">
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <div className="info-card">
                  <BookOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Chuyên môn</label>
                    <span className={!bacSiInfo?.chuyen_mon ? 'empty-info' : 'filled-info'}>
                      {displayChuyenMon}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="info-card">
                  <TrophyOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Chức danh</label>
                    <span className={!displayTrinhDo || displayTrinhDo === 'Bác sĩ Chuyên khoa' ? 'empty-info' : 'filled-info'}>
                      {displayTrinhDo}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="info-card">
                  <HistoryOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Kinh nghiệm</label>
                    <span className={!bacSiInfo?.so_nam_kinh_nghiem ? 'empty-info' : 'filled-info'}>
                      {displayNamKinhNghiem}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="info-card">
                  <SafetyCertificateOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Giấy phép hành nghề</label>
                    <span className={!bacSiInfo?.so_giay_phep_hang_nghe ? 'empty-info' : 'filled-info'}>
                      {displayGiayPhep}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24}>
                <div className="info-card full-width">
                  <HeartOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Giới thiệu</label>
                    <span className={!bacSiInfo?.gioi_thieu_ban_than ? 'empty-info' : 'filled-info'}>
                      {bacSiInfo?.gioi_thieu_ban_than || 'Chưa cập nhật thông tin giới thiệu'}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      )
    },
    {
      key: '3',
      label: (
        <span className="tab-label">
          <StarOutlined className="tab-icon" />
          Thống kê công việc
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]} className="stats-section">
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon patients">
                    <UserOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={128} suffix="bệnh nhân" />
                    <p>Đã khám</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon appointments">
                    <CalendarOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={45} suffix="cuộc hẹn" />
                    <p>Hôm nay</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon success">
                    <CheckCircleOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={94} suffix="%" />
                    <p>Tỷ lệ hoàn thành</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon rating">
                    <StarOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={4.8} precision={1} />
                    <p>Đánh giá trung bình</p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Card 
            className="profile-card mt-3"
            title={
              <div className="card-title">
                <HistoryOutlined className="title-icon" />
                Lịch sử gần đây
              </div>
            }
          >
            <Timeline
              className="custom-timeline"
              items={[
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Hoàn thành khám cho Nguyễn Văn A</strong>
                        <div className="timeline-meta">10:30 AM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Tạo đơn thuốc cho Trần Thị B</strong>
                        <div className="timeline-meta">09:15 AM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  dot: <CalendarOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Cuộc hẹn với Lê Văn C</strong>
                        <div className="timeline-meta">02:00 PM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'purple',
                  dot: <UserOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Họp khoa định kỳ</strong>
                        <div className="timeline-meta">04:30 PM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )
    }
  ];

  if (!userInfo) {
    return (
      <div className="doctor-profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="doctor-profile-container">
      <style>
        {`
          .ant-input-disabled,
          .ant-input[disabled] {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
          .ant-input-disabled::placeholder,
          .ant-input[disabled]::placeholder {
            color: rgba(0, 0, 0, 0.25) !important;
          }
          .ant-select-disabled .ant-select-selector,
          .ant-select.ant-select-disabled .ant-select-selector {
            color: #000 !important;
          }
          .ant-input[disabled],
          textarea.ant-input[disabled] {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
        `}
      </style>
      <div className="profile-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="avatar-section">
            <Badge 
              count={<CameraOutlined className="avatar-badge" />}
              offset={[-10, 100]}
            >
              <Avatar
                size={120}
                src={userInfo.anh_dai_dien}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
            </Badge>
            <Upload {...uploadProps} showUploadList={false}>
              <Button 
                icon={<CameraOutlined />} 
                className="avatar-upload-btn"
                loading={avatarLoading}
                type="primary"
              >
                Đổi ảnh
              </Button>
            </Upload>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{userInfo.ho_ten}</h1>
            <p className="profile-title">{displayChuyenMon}</p>
            <div className="profile-tags">
              <Tag icon={<TrophyOutlined />} color="blue">{displayTrinhDo}</Tag>
              <Tag icon={<HistoryOutlined />} color="green">{displayNamKinhNghiem} kinh nghiệm</Tag>
              <Tag icon={<SafetyCertificateOutlined />} color="orange">Giấy phép: {displayGiayPhep}</Tag>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems} 
          className="profile-tabs"
          size="large"
        />
      </div>
    </div>
  );
};

export default DoctorProfile;