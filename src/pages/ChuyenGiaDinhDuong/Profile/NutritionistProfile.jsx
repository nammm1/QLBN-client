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
  AppleOutlined
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
  Divider,
  Spin
} from 'antd';
import apiChuyenGiaDinhDuong from '../../../api/ChuyenGiaDinhDuong';
import apiNguoiDung from '../../../api/NguoiDung';
import apiCuocHenTuVan from '../../../api/CuocHenTuVan';
import apiHoSoDinhDuong from '../../../api/HoSoDinhDuong';
import apiUpload from '../../../api/Upload';
import './NutritionistProfile.css';

const { Option } = Select;
const { TextArea } = Input;

const NutritionistProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [chuyenGiaInfo, setChuyenGiaInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalRecords: 0,
    completedRate: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfoData = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfoData && userInfoData.user.id_nguoi_dung) {
        setUserInfo(userInfoData.user);
        const chuyenGiaProfile = await apiChuyenGiaDinhDuong.getById(userInfoData.user.id_nguoi_dung);
        setChuyenGiaInfo(chuyenGiaProfile);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin:', error);
      message.error('Không thể tải thông tin cá nhân');
    }
  };

  const fetchStats = async () => {
    try {
      const userInfoData = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfoData?.user?.id_nguoi_dung) {
        // Fetch appointments
        const appointments = await apiCuocHenTuVan.getByChuyenGia(userInfoData.user.id_nguoi_dung);
        const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
        const completed = Array.isArray(appointments) 
          ? appointments.filter(apt => apt.trang_thai === 'hoan_thanh').length 
          : 0;
        const completedRate = totalAppointments > 0 
          ? Math.round((completed / totalAppointments) * 100) 
          : 0;

        // Fetch records
        const records = await apiHoSoDinhDuong.getAll();
        const totalRecords = Array.isArray(records) 
          ? records.filter(r => r.id_chuyen_gia === userInfoData.user.id_nguoi_dung).length 
          : 0;

        setStats({
          totalAppointments,
          totalRecords,
          completedRate,
          averageRating: 4.8 // Mock data
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  useEffect(() => {
    if (userInfo && chuyenGiaInfo && !formInitialized) {
      form.setFieldsValue({
        ho_ten: userInfo.ho_ten,
        email: userInfo.email,
        so_dien_thoai: userInfo.so_dien_thoai,
        gioi_tinh: userInfo.gioi_tinh,
        dia_chi: userInfo.dia_chi,
        chuyen_nganh: chuyenGiaInfo.chuyen_nganh || chuyenGiaInfo.ten_chuyen_nganh,
        trinh_do: chuyenGiaInfo.trinh_do,
        so_giay_phep: chuyenGiaInfo.so_giay_phep,
        so_nam_kinh_nghiem: chuyenGiaInfo.so_nam_kinh_nghiem,
        gioi_thieu: chuyenGiaInfo.gioi_thieu || chuyenGiaInfo.mo_ta
      });
      setFormInitialized(true);
    }
  }, [userInfo, chuyenGiaInfo, form, formInitialized]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      const userInfoData = JSON.parse(localStorage.getItem("userInfo"));
      const id_chuyen_gia = userInfoData.user.id_nguoi_dung;

      // Update user info
      await apiNguoiDung.updateUser(id_chuyen_gia, {
        ho_ten: values.ho_ten,
        email: values.email,
        so_dien_thoai: values.so_dien_thoai,
        gioi_tinh: values.gioi_tinh,
        dia_chi: values.dia_chi
      });

      // Update chuyen gia info
      await apiChuyenGiaDinhDuong.update(id_chuyen_gia, {
        chuyen_nganh: values.chuyen_nganh,
        trinh_do: values.trinh_do,
        so_giay_phep: values.so_giay_phep,
        so_nam_kinh_nghiem: values.so_nam_kinh_nghiem,
        gioi_thieu: values.gioi_thieu
      });

      message.success('Cập nhật thông tin thành công');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      message.error('Cập nhật thất bại');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    try {
      const res = await apiUpload.uploadUserImage(file);
      const imageUrl = res?.data?.imageUrl || res?.data?.url || res?.url;
      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh');
      }

      const userInfoData = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const id_nguoi_dung = userInfoData?.user?.id_nguoi_dung;
      if (id_nguoi_dung) {
        await apiNguoiDung.updateUser(id_nguoi_dung, { anh_dai_dien: imageUrl });
      }

      const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (stored?.user) {
        const updated = { ...stored, user: { ...stored.user, anh_dai_dien: imageUrl } };
        localStorage.setItem('userInfo', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));
      }

      message.success('Cập nhật ảnh đại diện thành công');
      fetchProfile();
    } catch (error) {
      console.error(error);
      message.error('Upload ảnh thất bại');
    } finally {
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

  // Display values
  const displayChuyenNganh = chuyenGiaInfo?.chuyen_nganh || chuyenGiaInfo?.ten_chuyen_nganh || 'Chưa cập nhật';
  const displayTrinhDo = chuyenGiaInfo?.trinh_do || 'Chuyên gia dinh dưỡng';
  const displayNamKinhNghiem = chuyenGiaInfo?.so_nam_kinh_nghiem ? `${chuyenGiaInfo.so_nam_kinh_nghiem} năm` : 'Chưa cập nhật';
  const displayGiayPhep = chuyenGiaInfo?.so_giay_phep || 'Chưa cập nhật';

  // Tab items
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
                style={{
                  background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                  border: 'none'
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <div className="action-buttons">
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    fetchProfile();
                  }}
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
                style={{
                  background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                  border: 'none'
                }}
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
                    name="chuyen_nganh"
                    label="Chuyên ngành"
                    className="form-item-custom"
                  >
                    <Input 
                      placeholder="Chuyên ngành dinh dưỡng"
                      size="large"
                      className="custom-input"
                      prefix={<AppleOutlined className="input-icon" />}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="trinh_do"
                    label="Trình độ"
                    className="form-item-custom"
                  >
                    <Select 
                      placeholder="Chọn trình độ" 
                      size="large"
                      className="custom-select"
                      disabled
                    >
                      <Option value="Cử nhân dinh dưỡng">Cử nhân dinh dưỡng</Option>
                      <Option value="Thạc sĩ dinh dưỡng">Thạc sĩ dinh dưỡng</Option>
                      <Option value="Tiến sĩ dinh dưỡng">Tiến sĩ dinh dưỡng</Option>
                      <Option value="Chuyên gia dinh dưỡng">Chuyên gia dinh dưỡng</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="so_giay_phep"
                    label="Số giấy phép hành nghề"
                    className="form-item-custom"
                  >
                    <Input 
                      placeholder="Số giấy phép hành nghề"
                      size="large"
                      className="custom-input"
                      prefix={<SafetyCertificateOutlined className="input-icon" />}
                      disabled
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
                      disabled
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
                  disabled
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
                  <AppleOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Chuyên ngành</label>
                    <span className={!chuyenGiaInfo?.chuyen_nganh ? 'empty-info' : 'filled-info'}>
                      {displayChuyenNganh}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="info-card">
                  <TrophyOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Trình độ</label>
                    <span className={!displayTrinhDo || displayTrinhDo === 'Chuyên gia dinh dưỡng' ? 'empty-info' : 'filled-info'}>
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
                    <span className={!chuyenGiaInfo?.so_nam_kinh_nghiem ? 'empty-info' : 'filled-info'}>
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
                    <span className={!chuyenGiaInfo?.so_giay_phep ? 'empty-info' : 'filled-info'}>
                      {displayGiayPhep}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24}>
                <div className="info-card full-width">
                  <BookOutlined className="info-card-icon" />
                  <div className="info-card-content">
                    <label>Giới thiệu</label>
                    <span className={!chuyenGiaInfo?.gioi_thieu && !chuyenGiaInfo?.mo_ta ? 'empty-info' : 'filled-info'}>
                      {chuyenGiaInfo?.gioi_thieu || chuyenGiaInfo?.mo_ta || 'Chưa cập nhật thông tin giới thiệu'}
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
                  <div className="stat-icon appointments">
                    <CalendarOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={stats.totalAppointments} suffix="cuộc hẹn" />
                    <p>Tổng số</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon records">
                    <BookOutlined />
                  </div>
                  <div className="stat-info">
                    <Statistic value={stats.totalRecords} suffix="hồ sơ" />
                    <p>Đã tư vấn</p>
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
                    <Statistic value={stats.completedRate} suffix="%" />
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
                    <Statistic value={stats.averageRating} precision={1} />
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
                Hoạt động gần đây
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
                        <strong>Hoàn thành tư vấn dinh dưỡng</strong>
                        <div className="timeline-meta">10:30 AM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Duyệt hồ sơ dinh dưỡng mới</strong>
                        <div className="timeline-meta">09:15 AM - Hôm nay</div>
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  dot: <CalendarOutlined />,
                  children: (
                    <div className="timeline-item">
                      <div className="timeline-content">
                        <strong>Cuộc hẹn tư vấn sắp tới</strong>
                        <div className="timeline-meta">02:00 PM - Hôm nay</div>
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
      <div className="nutritionist-profile-loading">
        <Spin size="large" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="nutritionist-profile-container">
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
                style={{
                  background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)'
                }}
              />
            </Badge>
            <Upload {...uploadProps} showUploadList={false}>
              <Button 
                icon={<CameraOutlined />} 
                className="avatar-upload-btn"
                loading={avatarLoading}
                type="primary"
                style={{
                  background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                  border: 'none'
                }}
              >
                Đổi ảnh
              </Button>
            </Upload>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{userInfo.ho_ten}</h1>
            <p className="profile-title">{displayChuyenNganh}</p>
            <div className="profile-tags">
              <Tag icon={<TrophyOutlined />} color="blue">{displayTrinhDo}</Tag>
              <Tag icon={<HistoryOutlined />} color="blue">{displayNamKinhNghiem} kinh nghiệm</Tag>
              <Tag icon={<SafetyCertificateOutlined />} color="blue">Giấy phép: {displayGiayPhep}</Tag>
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

export default NutritionistProfile;

