import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Button,
  Typography,
  Upload,
  Modal,
  Space,
  Row,
  Col,
  Avatar,
  Divider,
  Spin,
  message
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  LockOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileProtectOutlined,
  ContactsOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  EditOutlined
} from "@ant-design/icons";
import "./UpdateProfile.css";
import apiBenhNhan from "../../api/BenhNhan";
import apiNguoiDung from "../../api/NguoiDung";
import apiUpload from "../../api/Upload";
import toast from "../../utils/toast";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const unwrap = (res) => {
  if (res == null) return null;
  const payload = res.data ?? res;
  if (payload && payload.data !== undefined) return payload.data;
  return payload;
};

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const id_nguoi_dung =
    userInfo?.user?.id_benh_nhan || userInfo?.user?.id_nguoi_dung || null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id_nguoi_dung) {
        setFetching(false);
        return console.warn("Không tìm thấy id_nguoi_dung");
      }

      setFetching(true);
      try {
        const resPatient = await apiBenhNhan.getById(id_nguoi_dung);
        const benhNhanData = unwrap(resPatient) ?? resPatient ?? {};

        const merged = {
          email: benhNhanData.email ?? "",
          so_dien_thoai: benhNhanData.so_dien_thoai ?? "",
          ho_ten: benhNhanData.ho_ten ?? "",
          ngay_sinh: benhNhanData.ngay_sinh ?? null,
          gioi_tinh: benhNhanData.gioi_tinh ?? "",
          so_cccd: benhNhanData.so_cccd ?? "",
          dia_chi: benhNhanData.dia_chi ?? "",
          anh_dai_dien: benhNhanData.anh_dai_dien ?? "",
          nghe_nghiep: benhNhanData.nghe_nghiep ?? "",
          ten_nguoi_lien_he_khan_cap: benhNhanData.ten_nguoi_lien_he_khan_cap ?? "",
          sdt_nguoi_lien_he_khan_cap: benhNhanData.sdt_nguoi_lien_he_khan_cap ?? "",
          ma_BHYT: benhNhanData.ma_BHYT ?? "",
          thong_tin_bao_hiem: benhNhanData.thong_tin_bao_hiem ?? "",
          tien_su_benh_ly: benhNhanData.tien_su_benh_ly ?? "",
          tinh_trang_suc_khoe_hien_tai: benhNhanData.tinh_trang_suc_khoe_hien_tai ?? "",
        };

        setProfileData(merged);
        form.setFieldsValue({
          ...merged,
          ngay_sinh: merged.ngay_sinh ? dayjs(merged.ngay_sinh) : null,
        });

        if (merged.anh_dai_dien) setImage(merged.anh_dai_dien);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu hồ sơ:", err);
        toast.error("Không thể tải thông tin bệnh nhân!");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id_nguoi_dung]);

  const handleImageChange = async (info) => {
    const file = info.file;
    if (!file) return;

    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file phải nhỏ hơn 5MB!");
      return;
    }

    const fileObj = file.originFileObj || file;
    
    if (!fileObj || !(fileObj instanceof Blob || fileObj instanceof File)) {
      toast.error("File không hợp lệ!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(fileObj);

    setUploadingImage(true);
    try {
      const response = await apiUpload.uploadUserImage(fileObj);
      if (response.success && response.data?.imageUrl) {
        setImage(response.data.imageUrl);
        toast.success("Upload ảnh thành công!");
      } else {
        toast.error("Upload ảnh thất bại!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor với message từ API
      // const errorMessage = error?.response?.data?.message || "Upload ảnh thất bại, vui lòng thử lại!";
      // toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!id_nguoi_dung) return toast.error("Không xác định được người dùng!");
    
    // Prevent double submit
    if (loading) return;
    
    setLoading(true);

    try {
      // Build userPayload, only include ngay_sinh if it has a valid value
      const userPayloadRaw = {
        email: values.email,
        so_dien_thoai: values.so_dien_thoai,
        ho_ten: values.ho_ten,
        gioi_tinh: values.gioi_tinh,
        so_cccd: values.so_cccd,
        dia_chi: values.dia_chi,
        ...(image && (image.startsWith('http') || image.startsWith('data:')) ? { anh_dai_dien: image } : {}),
      };

      // Only add ngay_sinh if it has a valid value (not null/undefined)
      if (values.ngay_sinh) {
        userPayloadRaw.ngay_sinh = values.ngay_sinh.format("YYYY-MM-DD");
      }

      // Filter out empty/undefined/null values from userPayload
      const userPayload = Object.keys(userPayloadRaw).reduce((acc, key) => {
        const value = userPayloadRaw[key];
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Remove empty/undefined/null values from patientPayload
      const patientPayloadRaw = {
        nghe_nghiep: values.nghe_nghiep,
        ten_nguoi_lien_he_khan_cap: values.ten_nguoi_lien_he_khan_cap,
        sdt_nguoi_lien_he_khan_cap: values.sdt_nguoi_lien_he_khan_cap,
        ma_BHYT: values.ma_BHYT,
        thong_tin_bao_hiem: values.thong_tin_bao_hiem,
        tien_su_benh_ly: values.tien_su_benh_ly,
        tinh_trang_suc_khoe_hien_tai: values.tinh_trang_suc_khoe_hien_tai,
      };

      // Filter out empty, undefined, and null values
      const patientPayload = Object.keys(patientPayloadRaw).reduce((acc, key) => {
        const value = patientPayloadRaw[key];
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Prepare update promises - only call APIs if payloads have data
      const updatePromises = [];
      
      // Only add user update if payload has data
      if (Object.keys(userPayload).length > 0) {
        updatePromises.push(apiNguoiDung.updateUser(id_nguoi_dung, userPayload));
      }
      
      // Only add patient update if payload has data
      if (Object.keys(patientPayload).length > 0) {
        updatePromises.push(apiBenhNhan.update(id_nguoi_dung, patientPayload));
      }

      // Only proceed if there's at least one update to perform
      if (updatePromises.length === 0) {
        toast.warning("Không có thông tin nào để cập nhật!");
        setLoading(false);
        return;
      }

      await Promise.all(updatePromises);

      toast.success("Cập nhật thông tin thành công!");
      
      if (userInfo?.user) {
        const updatedUserInfo = {
          ...userInfo,
          user: {
            ...userInfo.user,
            ho_ten: values.ho_ten,
            email: values.email,
            so_dien_thoai: values.so_dien_thoai,
            anh_dai_dien: image || values.anh_dai_dien,
          }
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      // Toast đã được hiển thị tự động bởi axios interceptor với message từ API
      // const errorMessage = err?.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại!";
      // toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    const { mat_khau_hien_tai, mat_khau_moi, xac_nhan_mat_khau } = values;
    if (mat_khau_moi !== xac_nhan_mat_khau) {
      return toast.error("Mật khẩu mới không khớp!");
    }

    if (mat_khau_moi.length < 6) {
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    try {
      await apiNguoiDung.changePassword(id_nguoi_dung, {
        mat_khau_hien_tai,
        mat_khau_moi,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordModal(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor với message từ API
      // const errorMessage = error?.response?.data?.message || "Đổi mật khẩu thất bại!";
      // toast.error(errorMessage);
    }
  };

  const tabs = [
    { key: "personal", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    { key: "medical", label: "Thông tin y tế", icon: <TeamOutlined /> },
  ];

  if (fetching) {
    return (
      <div className="modern-profile-container">
        <div className="modern-loading-wrapper">
          <div className="modern-spinner">
            <Spin size="large" />
          </div>
          <Text className="modern-loading-text">Đang tải thông tin...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-profile-container">
      <div className="modern-profile-wrapper">
        {/* Glassmorphism Header */}
        <div className="modern-profile-header">
          <div className="modern-header-content">
            <div className="modern-header-text">
              <Title level={1} className="modern-header-title">
                Hồ Sơ Cá Nhân
              </Title>
              <Text className="modern-header-subtitle">
                Quản lý và cập nhật thông tin tài khoản của bạn
              </Text>
            </div>
            <div className="modern-header-actions">
              <Button
                type="primary"
                icon={<LockOutlined />}
                size="large"
                onClick={() => setPasswordModal(true)}
                className="modern-password-btn"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>

        <div className="modern-profile-content">
          {/* Sidebar Profile */}
          <div className="modern-profile-sidebar">
            <div className="modern-avatar-section">
              <div className="modern-avatar-wrapper">
                <Avatar
                  src={image}
                  size={140}
                  icon={<UserOutlined />}
                  className="modern-profile-avatar"
                />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  className="modern-avatar-upload"
                  disabled={uploadingImage}
                >
                  <div className="modern-avatar-overlay">
                    <CameraOutlined className="modern-camera-icon" />
                  </div>
                </Upload>
                {uploadingImage && (
                  <div className="modern-avatar-loading">
                    <Spin size="small" />
                  </div>
                )}
              </div>
              <div className="modern-user-info">
                <Title level={3} className="modern-user-name">
                  {profileData?.ho_ten || "Chưa có tên"}
                </Title>
                <Text className="modern-user-role">Bệnh nhân</Text>
                <div className="modern-user-stats">
                  <div className="modern-stat-item">
                    <SafetyCertificateOutlined />
                    <span>Đã xác thực</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="modern-sidebar-nav">
              {tabs.map(tab => (
                <div
                  key={tab.key}
                  className={`modern-nav-item ${activeTab === tab.key ? 'modern-nav-item-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="modern-nav-icon">{tab.icon}</span>
                  <span className="modern-nav-label">{tab.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="modern-profile-main">
            <Card className="modern-form-card">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                className="modern-profile-form"
              >
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div className="modern-form-section">
                    <div className="modern-section-header">
                      <UserOutlined className="modern-section-icon" />
                      <Title level={4} className="modern-section-title">
                        Thông tin cá nhân
                      </Title>
                    </div>
                    
                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="ho_ten"
                          label="Họ và tên"
                          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                        >
                          <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Nhập họ và tên" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="ngay_sinh"
                          label="Ngày sinh"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            className="modern-input"
                            placeholder="Chọn ngày sinh"
                            suffixIcon={<CalendarOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="gioi_tinh"
                          label="Giới tính"
                        >
                          <Radio.Group 
                            className="modern-gender-radio-group"
                          >
                            <Radio.Button 
                              value="Nam" 
                              className="modern-gender-radio modern-gender-male"
                            >
                              <ManOutlined className="modern-gender-icon" />
                              <span>Nam</span>
                            </Radio.Button>
                            <Radio.Button 
                              value="Nữ" 
                              className="modern-gender-radio modern-gender-female"
                            >
                              <WomanOutlined className="modern-gender-icon" />
                              <span>Nữ</span>
                            </Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            { type: "email", message: "Email không hợp lệ!" },
                            { required: true, message: "Vui lòng nhập email!" }
                          ]}
                        >
                          <Input 
                            prefix={<MailOutlined />} 
                            placeholder="Nhập email" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="so_dien_thoai"
                          label="Số điện thoại"
                        >
                          <Input 
                            prefix={<PhoneOutlined />} 
                            placeholder="Nhập số điện thoại" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="so_cccd"
                          label="Số CCCD"
                        >
                          <Input 
                            prefix={<IdcardOutlined />} 
                            placeholder="Nhập số CCCD" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="dia_chi"
                          label="Địa chỉ"
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Nhập địa chỉ"
                            className="modern-input"
                            prefix={<HomeOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Medical Information Tab */}
                {activeTab === "medical" && (
                  <div className="modern-form-section">
                    <div className="modern-section-header">
                      <TeamOutlined className="modern-section-icon" />
                      <Title level={4} className="modern-section-title">
                        Thông tin y tế
                      </Title>
                    </div>
                    
                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="nghe_nghiep"
                          label="Nghề nghiệp"
                        >
                          <Input 
                            prefix={<TeamOutlined />} 
                            placeholder="Nhập nghề nghiệp" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="ma_BHYT"
                          label="Mã BHYT"
                        >
                          <Input 
                            prefix={<FileProtectOutlined />} 
                            placeholder="Nhập mã BHYT" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="ten_nguoi_lien_he_khan_cap"
                          label="Người liên hệ khẩn cấp"
                        >
                          <Input 
                            prefix={<ContactsOutlined />} 
                            placeholder="Nhập tên người liên hệ" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="sdt_nguoi_lien_he_khan_cap"
                          label="SĐT người liên hệ"
                        >
                          <Input 
                            prefix={<PhoneOutlined />} 
                            placeholder="Nhập số điện thoại" 
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="thong_tin_bao_hiem"
                          label="Thông tin bảo hiểm"
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Nhập thông tin bảo hiểm"
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="tien_su_benh_ly"
                          label="Tiền sử bệnh lý"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Nhập tiền sử bệnh lý, các bệnh đã mắc trước đây..."
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="tinh_trang_suc_khoe_hien_tai"
                          label="Tình trạng sức khỏe hiện tại"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Nhập tình trạng sức khỏe hiện tại..."
                            className="modern-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Save Button */}
                <div className="modern-form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    loading={loading}
                    className="modern-save-btn"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        title={
          <div className="modern-modal-title">
            <LockOutlined /> Đổi mật khẩu
          </div>
        }
        open={passwordModal}
        onCancel={() => {
          setPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
        className="modern-password-modal"
        width={480}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          size="large"
        >
          <Form.Item
            name="mat_khau_hien_tai"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu hiện tại" 
              className="modern-input"
            />
          </Form.Item>
          <Form.Item
            name="mat_khau_moi"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu mới" 
              className="modern-input"
            />
          </Form.Item>
          <Form.Item
            name="xac_nhan_mat_khau"
            label="Xác nhận mật khẩu mới"
            dependencies={["mat_khau_moi"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("mat_khau_moi") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Nhập lại mật khẩu mới" 
              className="modern-input"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="modern-submit-btn"
              size="large"
            >
              <LockOutlined /> Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UpdateProfile;