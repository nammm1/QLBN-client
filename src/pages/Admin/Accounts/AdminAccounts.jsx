import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiNguoiDung from "../../../api/NguoiDung";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Avatar,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Switch,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { checkAgeForAccountCreation } from "../../../utils/checkAgeForAccountCreation";
import "./AdminAccounts.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const vaiTro = Form.useWatch("vai_tro", form);
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]);
  const [chuyenNganhList, setChuyenNganhList] = useState([]);
  const pageSize = 10;

  const navigate = useNavigate();

  // 🔹 Lấy danh sách tài khoản
  const fetchUsers = async () => {
    try {
      const res = await apiNguoiDung.getAllUsers();
      setUsers(res);
      setFilteredUsers(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchChuyenKhoa();
    fetchChuyenNganh();
  }, []);

  // Lấy danh sách chuyên khoa
  const fetchChuyenKhoa = async () => {
    try {
      const res = await apiChuyenKhoa.getAllChuyenKhoa();
      setChuyenKhoaList(res || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
    }
  };

  // Lấy danh sách chuyên ngành dinh dưỡng
  const fetchChuyenNganh = async () => {
    try {
      const res = await apiChuyenGiaDinhDuong.getAllChuyenNganh();
      setChuyenNganhList(res || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên ngành dinh dưỡng:", error);
    }
  };

  // 🔹 Lọc người dùng
  useEffect(() => {
    let filtered = [...users];

    const name = (searchName || "").trim().toLowerCase();
    const role = (searchRole || "").trim();
    const gender = (searchGender || "").trim().toLowerCase();

    if (name) {
      filtered = filtered.filter((u) =>
        u.ho_ten?.toLowerCase().includes(name)
      );
    }
    if (role) {
      filtered = filtered.filter((u) => u.vai_tro === role);
    }
    if (gender) {
      filtered = filtered.filter(
        (u) => u.gioi_tinh?.toLowerCase() === gender
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchName, searchRole, searchGender, users]);

  const handleSelect = (id_nguoi_dung) => {
    navigate(`/admin/accounts/${id_nguoi_dung}`);
  };

  // 🔹 Cập nhật trạng thái hoạt động
  const handleToggleStatus = async (id_nguoi_dung, currentStatus, e) => {
    if (e) {
      e.stopPropagation(); // Ngăn chặn sự kiện click lan ra row
    }
    try {
      const newStatus = currentStatus ? false : true;
      // Convert boolean sang format mà backend có thể nhận
      // Backend lưu là tinyint(1): 1 = true, 0 = false
      await apiNguoiDung.updateUser(id_nguoi_dung, {
        trang_thai_hoat_dong: newStatus
      });
      message.success(
        newStatus ? "Kích hoạt tài khoản thành công!" : "Ngừng hoạt động tài khoản thành công!"
      );
      fetchUsers(); // Refresh danh sách
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Không thể cập nhật trạng thái!");
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredUsers.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const getGenderTag = (gender) => {
    if (!gender) return <Tag>Không</Tag>;
    return gender.toLowerCase() === "nam" ? (
      <Tag icon={<ManOutlined />} color="blue">Nam</Tag>
    ) : (
      <Tag icon={<WomanOutlined />} color="pink">Nữ</Tag>
    );
  };

  // 🔹 Thêm tài khoản
  const handleAddAccount = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        ngay_sinh: values.ngay_sinh
          ? dayjs(values.ngay_sinh).format("YYYY-MM-DD")
          : null,
      };
      
      // Kiểm tra tuổi (phải >= 6 tuổi mới được tạo tài khoản)
      if (formattedValues.ngay_sinh) {
        const ageCheck = checkAgeForAccountCreation(formattedValues.ngay_sinh);
        if (!ageCheck.isValid) {
          console.log(`[ADMIN_ADD_ACCOUNT] Người dùng không đủ tuổi: ${ageCheck.message}`);
          message.error(ageCheck.message);
          setLoading(false);
          return;
        }
      }
      
      // Xử lý chuyên ngành dinh dưỡng - chuyển thành array nếu là string
      if (formattedValues.chuyen_nganh_dinh_duong && !Array.isArray(formattedValues.chuyen_nganh_dinh_duong)) {
        formattedValues.chuyen_nganh_dinh_duong = [formattedValues.chuyen_nganh_dinh_duong];
      }
      
      const response = await apiNguoiDung.createUser(formattedValues);
      const successMessage = response?.data?.message || "Thêm tài khoản thành công! Mật khẩu đã được gửi qua email.";
      message.success(successMessage);
      setIsAddModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      const errorMessage = error?.response?.data?.message || "Không thể thêm tài khoản!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thay đổi vai trò
  const handleRoleChange = () => {
    // Reset các trường liên quan đến vai trò cũ
    form.setFieldsValue({
      id_chuyen_khoa: undefined,
      chuyen_mon: undefined,
      so_giay_phep_hang_nghe: undefined,
      gioi_thieu_ban_than: undefined,
      so_nam_kinh_nghiem: undefined,
      chuc_danh: undefined,
      chuc_vu: undefined,
      hoc_vi: undefined,
      so_chung_chi_hang_nghe: undefined,
      linh_vuc_chuyen_sau: undefined,
      chuyen_nganh_dinh_duong: undefined,
      // Nhân viên quầy
      ma_nhan_vien: undefined,
      bo_phan_lam_viec: undefined,
      ca_lam_viec: undefined,
      // Nhân viên phân công
      quyen_han_phan_cong: undefined,
    });
  };

  const columns = [
    {
      title: "ID NGƯỜI DÙNG",
      dataIndex: "id_nguoi_dung",
      key: "id_nguoi_dung",
      render: (id) => <Text copyable>{id}</Text>,
      width: 200,
    },
    {
      title: "HỌ TÊN",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name || "Không"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined />
          {email || "Không"}
        </Space>
      ),
      width: 200,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone || "Không"}
        </Space>
      ),
      width: 150,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gioi_tinh",
      key: "gioi_tinh",
      render: (gender) => getGenderTag(gender),
      width: 100,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "vai_tro",
      key: "vai_tro",
      render: (role) => {
        let color = "blue";
        if (role === "quan_tri_vien") color = "red";
        else if (role === "bac_si") color = "green";
        else if (role === "benh_nhan") color = "purple";
        else if (role === "chuyen_gia_dinh_duong") color = "orange";
        return <Tag color={color}>{role?.replaceAll("_", " ").toUpperCase()}</Tag>;
      },
      width: 150,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai_hoat_dong",
      key: "trang_thai_hoat_dong",
      width: 180,
      render: (status, record) => {
        // Xử lý cả boolean và string format
        const isActive = status === true || status === 1 || status === "HoatDong" || status === "1";
        return (
          <Space onClick={(e) => e.stopPropagation()}>
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? "Hoạt động" : "Ngừng"}
            </Tag>
            <Popconfirm
              title={`Bạn có chắc muốn ${isActive ? "ngừng" : "kích hoạt"} tài khoản này?`}
              onConfirm={() => handleToggleStatus(record.id_nguoi_dung, isActive)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Switch
                checked={isActive}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-accounts-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            👥 Quản lý tài khoản
          </Title>
          <Text type="secondary">
            Xem, thêm và quản lý người dùng trong hệ thống
          </Text>
        </div>

        {/* Bộ lọc */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Tìm theo họ tên..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
              />
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Chọn vai trò"
                value={searchRole || undefined}
                onChange={(value) => setSearchRole(value || "")}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="benh_nhan">Bệnh nhân</Option>
                <Option value="bac_si">Bác sĩ</Option>
                <Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Option>
                <Option value="nhan_vien_quay">Nhân viên quầy</Option>
                <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
                <Option value="quan_tri_vien">Quản trị viên</Option>
              </Select>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Giới tính"
                value={searchGender || undefined}
                onChange={(value) => setSearchGender(value || "")}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <Row justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm tài khoản
                </Button>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Bảng */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={currentPageData.map((item) => ({
              ...item,
              key: item.id_nguoi_dung,
            }))}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => handleSelect(record.id_nguoi_dung),
              style: { cursor: "pointer" },
            })}
          />
        </Card>

        {/* Modal thêm tài khoản */}
        <Modal
          title="➕ Thêm tài khoản mới"
          open={isAddModalOpen}
          onCancel={() => {
            setIsAddModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          width={700}
          style={{ maxHeight: "90vh" }}
        >
          <Form layout="vertical" form={form} onFinish={handleAddAccount}>
            <Form.Item
              label="Tên đăng nhập"
              name="ten_dang_nhap"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
              <Input placeholder="Nhập tên đăng nhập..." />
            </Form.Item>
            <Form.Item 
              label="Email" 
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" }
              ]}
            >
              <Input placeholder="Nhập email..." />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="so_dien_thoai">
              <Input placeholder="Nhập số điện thoại..." />
            </Form.Item>
            <Form.Item label="Họ tên" name="ho_ten">
              <Input placeholder="Nhập họ tên..." />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="ngay_sinh">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Giới tính" name="gioi_tinh">
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Số CCCD" name="so_cccd">
              <Input placeholder="Nhập số CCCD..." />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="dia_chi">
              <Input placeholder="Nhập địa chỉ..." />
            </Form.Item>
            <Form.Item
              label="Vai trò"
              name="vai_tro"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select 
                placeholder="Chọn vai trò"
                onChange={handleRoleChange}
              >
                <Option value="benh_nhan">Bệnh nhân</Option>
                <Option value="bac_si">Bác sĩ</Option>
                <Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Option>
                <Option value="nhan_vien_quay">Nhân viên quầy</Option>
                <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
                <Option value="nhan_vien_xet_nghiem">Nhân viên xét nghiệm</Option>
                <Option value="quan_tri_vien">Quản trị viên</Option>
              </Select>
            </Form.Item>

            {/* Các trường riêng cho Bác sĩ */}
            {vaiTro === "bac_si" && (
              <>
                <Form.Item 
                  label="Chuyên khoa" 
                  name="id_chuyen_khoa"
                  rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
                >
                  <Select placeholder="Chọn chuyên khoa" allowClear>
                    {chuyenKhoaList.map((ck) => (
                      <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                        {ck.ten_chuyen_khoa}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Chuyên môn" name="chuyen_mon">
                  <Input placeholder="Nhập chuyên môn..." />
                </Form.Item>
                <Form.Item label="Số giấy phép hành nghề" name="so_giay_phep_hang_nghe">
                  <Input placeholder="Nhập số giấy phép hành nghề..." />
                </Form.Item>
                <Form.Item label="Số năm kinh nghiệm" name="so_nam_kinh_nghiem">
                  <InputNumber 
                    placeholder="Nhập số năm kinh nghiệm" 
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Chức danh" name="chuc_danh">
                  <Input placeholder="Nhập chức danh..." />
                </Form.Item>
                <Form.Item label="Chức vụ" name="chuc_vu">
                  <Input placeholder="Nhập chức vụ..." />
                </Form.Item>
                <Form.Item label="Giới thiệu bản thân" name="gioi_thieu_ban_than">
                  <Input.TextArea 
                    placeholder="Nhập giới thiệu bản thân..." 
                    rows={4}
                  />
                </Form.Item>
              </>
            )}

            {/* Các trường riêng cho Chuyên gia dinh dưỡng */}
            {vaiTro === "chuyen_gia_dinh_duong" && (
              <>
                <Form.Item 
                  label="Học vị" 
                  name="hoc_vi"
                  rules={[{ required: true, message: "Vui lòng chọn học vị!" }]}
                >
                  <Select placeholder="Chọn học vị">
                    <Option value="Cu nhan">Cử nhân</Option>
                    <Option value="Thac si">Thạc sĩ</Option>
                    <Option value="Tien si">Tiến sĩ</Option>
                    <Option value="Giao su">Giáo sư</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Số chứng chỉ hành nghề" name="so_chung_chi_hang_nghe">
                  <Input placeholder="Nhập số chứng chỉ hành nghề..." />
                </Form.Item>
                <Form.Item label="Lĩnh vực chuyên sâu" name="linh_vuc_chuyen_sau">
                  <Input placeholder="Nhập lĩnh vực chuyên sâu..." />
                </Form.Item>
                <Form.Item label="Chức vụ" name="chuc_vu">
                  <Input placeholder="Nhập chức vụ..." />
                </Form.Item>
                <Form.Item label="Giới thiệu bản thân" name="gioi_thieu_ban_than">
                  <Input.TextArea 
                    placeholder="Nhập giới thiệu bản thân..." 
                    rows={4}
                  />
                </Form.Item>
                <Form.Item 
                  label="Chuyên ngành dinh dưỡng" 
                  name="chuyen_nganh_dinh_duong"
                  rules={[{ required: true, message: "Vui lòng chọn ít nhất một chuyên ngành dinh dưỡng!" }]}
                >
                  <Select 
                    mode="multiple" 
                    placeholder="Chọn chuyên ngành dinh dưỡng"
                    allowClear
                  >
                    {chuyenNganhList.map((cn) => (
                      <Option key={cn.id_chuyen_nganh} value={cn.id_chuyen_nganh}>
                        {cn.ten_chuyen_nganh}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {/* Các trường riêng cho Nhân viên quầy */}
            {vaiTro === "nhan_vien_quay" && (
              <>
                <Form.Item 
                  label="Mã nhân viên" 
                  name="ma_nhan_vien"
                  rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
                >
                  <Input placeholder="Nhập mã nhân viên..." />
                </Form.Item>
                <Form.Item label="Bộ phận làm việc" name="bo_phan_lam_viec">
                  <Input placeholder="Nhập bộ phận làm việc..." />
                </Form.Item>
                <Form.Item label="Ca làm việc" name="ca_lam_viec">
                  <Select placeholder="Chọn ca làm việc" allowClear>
                    <Option value="Sang">Sáng</Option>
                    <Option value="Chieu">Chiều</Option>
                    <Option value="Toi">Tối</Option>
                    <Option value="Full">Full</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* Các trường riêng cho Nhân viên phân công */}
            {vaiTro === "nhan_vien_phan_cong" && (
              <>
                <Form.Item 
                  label="Mã nhân viên" 
                  name="ma_nhan_vien"
                  rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
                >
                  <Input placeholder="Nhập mã nhân viên..." />
                </Form.Item>
                <Form.Item 
                  label="Quyền hạn phân công" 
                  name="quyen_han_phan_cong"
                  rules={[{ required: true, message: "Vui lòng chọn quyền hạn phân công!" }]}
                >
                  <Select placeholder="Chọn quyền hạn phân công">
                    <Option value="phong_kham">Phòng khám</Option>
                    <Option value="toan_benh_vien">Toàn bệnh viện</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* Các trường riêng cho Nhân viên xét nghiệm */}
            {vaiTro === "nhan_vien_xet_nghiem" && (
              <>
                <Form.Item label="Chuyên môn" name="chuyen_mon">
                  <Input placeholder="Nhập chuyên môn..." />
                </Form.Item>
                <Form.Item label="Số chứng chỉ hành nghề" name="so_chung_chi_hang_nghe">
                  <Input placeholder="Nhập số chứng chỉ hành nghề..." />
                </Form.Item>
                <Form.Item label="Lĩnh vực chuyên sâu" name="linh_vuc_chuyen_sau">
                  <Input placeholder="Nhập lĩnh vực chuyên sâu..." />
                </Form.Item>
                <Form.Item label="Số năm kinh nghiệm" name="so_nam_kinh_nghiem">
                  <InputNumber 
                    placeholder="Nhập số năm kinh nghiệm" 
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Chức vụ" name="chuc_vu">
                  <Input placeholder="Nhập chức vụ..." />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Phân trang */}
        <div className="pagination-section">
          <Space>
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                type={page === currentPage ? "primary" : "default"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau ›
            </Button>
          </Space>
          <Text type="secondary">
            Trang {currentPage}/{totalPages}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminAccounts;
