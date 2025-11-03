import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  Radio,
  Card,
  Tag,
  App,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiBenhNhan from "../../../api/BenhNhan";
import apiLichLamViec from "../../../api/LichLamViec";
import apiKhungGioKham from "../../../api/KhungGioKham";
import apiBacSi from "../../../api/BacSi";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiNguoiDung from "../../../api/NguoiDung";
import "./AutoBookingModal.css";

const { Option } = Select;

// Format ngày thành YYYY-MM-DD
const formatDate = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convert enum ca sang hiển thị
const formatCaToDisplay = (ca) => {
  const mapping = {
    Sang: "Sáng",
    Chieu: "Chiều",
    Toi: "Tối",
    sang: "Sáng",
    chieu: "Chiều",
    toi: "Tối",
  };
  return mapping[ca] || ca;
};

const AutoBookingModal = ({ visible, onCancel, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState(""); // "kham_benh" | "tu_van_dinh_duong"
  const [patients, setPatients] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loaiHen, setLoaiHen] = useState("truc_tiep"); // truc_tiep | online
  const [lyDo, setLyDo] = useState("");

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (visible) {
      fetchInitialData();
      form.resetFields();
      setServiceType("");
      setSelectedPatient(null);
      setSelectedSpecialty(null);
      setSelectedDate(null);
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
      setLoaiHen("truc_tiep");
      setLyDo("");
    }
  }, [visible]);

  const fetchInitialData = async () => {
    try {
      const [patientData, specialtyData] = await Promise.all([
        apiBenhNhan.getAll(),
        apiChuyenKhoa.getAllChuyenKhoa(),
      ]);
      setPatients(patientData || []);
      setSpecialties(specialtyData || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu");
    }
  };

  // Load khung giờ trống khi chọn ngày
  useEffect(() => {
    if (selectedDate && serviceType) {
      fetchAvailableTimeSlots();
    } else {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, serviceType, selectedSpecialty]);

  const fetchAvailableTimeSlots = async () => {
    if (!selectedDate || !serviceType) return;

    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      
      // Lấy tất cả lịch làm việc trong ngày
      const allSchedules = await apiLichLamViec.getAll();
      const schedulesOnDate = allSchedules.filter(
        (schedule) => formatDate(new Date(schedule.ngay_lam_viec)) === dateStr
      );

      // Lấy tất cả khung giờ
      const allTimeSlots = await apiKhungGioKham.getAll();

      const availableSlots = [];

      if (serviceType === "kham_benh") {
        // Đối với khám bệnh: tìm bác sĩ có lịch trống
        const allDoctors = await apiBacSi.getAll();
        
        // Merge với thông tin user
        const mergedDoctors = await Promise.all(
          allDoctors.map(async (bs) => {
            try {
              const user = await apiNguoiDung.getUserById(bs.id_bac_si);
              return { ...bs, ...user };
            } catch (err) {
              console.error("Lỗi khi lấy user cho bác sĩ:", err);
              return bs;
            }
          })
        );

        let doctorsToCheck = mergedDoctors;

        // Nếu có chọn chuyên khoa, filter theo chuyên khoa
        if (selectedSpecialty) {
          doctorsToCheck = mergedDoctors.filter(
            (bs) => String(bs.id_chuyen_khoa) === String(selectedSpecialty)
          );
        }

        // Với mỗi khung giờ, kiểm tra xem có bác sĩ nào còn chỗ trống
        for (const timeSlot of allTimeSlots) {
          // Tìm các bác sĩ có lịch làm việc trong ca này
          const ca = timeSlot.ca;
          const doctorsInCa = schedulesOnDate
            .filter((s) => s.ca === ca)
            .map((s) => s.id_nguoi_dung);

          const availableDoctors = doctorsToCheck.filter((doctor) =>
            doctorsInCa.includes(doctor.id_bac_si)
          );

          // Kiểm tra từng bác sĩ xem còn chỗ trống không
          for (const doctor of availableDoctors) {
            try {
              const countData = await apiCuocHenKhamBenh.countByTimeSlot(
                doctor.id_bac_si,
                timeSlot.id_khung_gio,
                dateStr
              );

              if (countData.count < countData.max_count) {
                // Lấy tên chuyên khoa từ danh sách specialties
                const specialty = specialties.find(
                  (sp) => sp.id_chuyen_khoa === doctor.id_chuyen_khoa
                );
                
                // Còn chỗ trống, thêm vào danh sách
                availableSlots.push({
                  ...timeSlot,
                  id_bac_si: doctor.id_bac_si,
                  id_chuyen_khoa: doctor.id_chuyen_khoa,
                  ten_bac_si: doctor.ho_ten,
                  ten_chuyen_khoa: specialty?.ten_chuyen_khoa || "",
                  bookedCount: countData.count,
                  maxCount: countData.max_count,
                  availableSlots: countData.max_count - countData.count,
                });
                break; // Chỉ cần 1 bác sĩ còn chỗ là đủ
              }
            } catch (err) {
              console.error(
                `Lỗi khi check bác sĩ ${doctor.id_bac_si}:`,
                err
              );
            }
          }
        }
      } else if (serviceType === "tu_van_dinh_duong") {
        // Đối với tư vấn dinh dưỡng: tìm chuyên gia có lịch trống
        const allExperts = await apiChuyenGiaDinhDuong.getAll();

        // Merge với thông tin user
        const mergedExperts = await Promise.all(
          allExperts.map(async (cg) => {
            try {
              const user = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
              return { ...cg, ...user };
            } catch (err) {
              console.error("Lỗi khi lấy user cho chuyên gia:", err);
              return cg;
            }
          })
        );

        // Với mỗi khung giờ, kiểm tra xem có chuyên gia nào còn chỗ trống
        for (const timeSlot of allTimeSlots) {
          // Tìm các chuyên gia có lịch làm việc trong ca này
          const ca = timeSlot.ca;
          const expertsInCa = schedulesOnDate
            .filter((s) => s.ca === ca)
            .map((s) => s.id_nguoi_dung);

          const availableExperts = mergedExperts.filter((expert) =>
            expertsInCa.includes(expert.id_chuyen_gia)
          );

          // Kiểm tra từng chuyên gia xem còn chỗ trống không
          for (const expert of availableExperts) {
            try {
              const countData = await apiCuocHenTuVan.countByTimeSlot(
                expert.id_chuyen_gia,
                timeSlot.id_khung_gio,
                dateStr
              );

              if (countData.count < countData.max_count) {
                // Còn chỗ trống, thêm vào danh sách
                availableSlots.push({
                  ...timeSlot,
                  id_chuyen_gia: expert.id_chuyen_gia,
                  ten_chuyen_gia: expert.ho_ten,
                  bookedCount: countData.count,
                  maxCount: countData.max_count,
                  availableSlots: countData.max_count - countData.count,
                });
                break; // Chỉ cần 1 chuyên gia còn chỗ là đủ
              }
            } catch (err) {
              console.error(
                `Lỗi khi check chuyên gia ${expert.id_chuyen_gia}:`,
                err
              );
            }
          }
        }
      }

      // Sắp xếp theo giờ bắt đầu
      availableSlots.sort((a, b) => {
        const timeA = a.gio_bat_dau;
        const timeB = b.gio_bat_dau;
        return timeA.localeCompare(timeB);
      });

      setAvailableTimeSlots(availableSlots);
    } catch (error) {
      console.error("Lỗi khi tải khung giờ:", error);
      message.error("Không thể tải khung giờ trống");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !serviceType || !selectedDate || !selectedTimeSlot || !lyDo) {
      message.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      const timeSlot = availableTimeSlots.find(
        (slot) => slot.id_khung_gio === selectedTimeSlot
      );

      if (!timeSlot) {
        message.error("Không tìm thấy khung giờ đã chọn!");
        return;
      }

      if (serviceType === "kham_benh") {
        // Đặt lịch khám bệnh
        const payload = {
          id_benh_nhan: selectedPatient,
          id_bac_si: timeSlot.id_bac_si,
          id_chuyen_khoa: selectedSpecialty || timeSlot.id_chuyen_khoa,
          id_khung_gio: timeSlot.id_khung_gio,
          ngay_kham: dateStr,
          loai_hen: loaiHen,
          ly_do_kham: lyDo,
          trieu_chung: null,
        };

        console.log("Debug - Payload to send:", payload);
        console.log("Debug - selectedPatient value:", selectedPatient);
        await apiCuocHenKhamBenh.create(payload);
        message.success("Đặt lịch khám bệnh thành công!");
      } else if (serviceType === "tu_van_dinh_duong") {
        // Đặt lịch tư vấn dinh dưỡng
        const payload = {
          id_benh_nhan: selectedPatient,
          id_chuyen_gia: timeSlot.id_chuyen_gia,
          id_khung_gio: timeSlot.id_khung_gio,
          ngay_kham: dateStr,
          loai_hen: loaiHen,
          loai_dinh_duong: "",
          ly_do_tu_van: lyDo,
        };

        await apiCuocHenTuVan.create(payload);
        message.success("Đặt lịch tư vấn dinh dưỡng thành công!");
      }

      // Reset form
      form.resetFields();
      setServiceType("");
      setSelectedPatient(null);
      setSelectedSpecialty(null);
      setSelectedDate(null);
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
      setLoaiHen("truc_tiep");
      setLyDo("");

      if (onSuccess) {
        onSuccess();
      }
      onCancel();
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      // Error message đã được hiển thị tự động bởi axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CalendarOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Đặt lịch hẹn tự động
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="auto-booking-modal"
    >
      <Form form={form} layout="vertical">
        {/* Chọn loại dịch vụ */}
        <Form.Item label="Loại dịch vụ" required>
          <Radio.Group
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value);
              setSelectedSpecialty(null);
              setSelectedDate(null);
              setAvailableTimeSlots([]);
              setSelectedTimeSlot(null);
            }}
            style={{ width: "100%" }}
          >
            <Radio.Button value="kham_benh" style={{ width: "50%", textAlign: "center" }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} />
              Khám bệnh
            </Radio.Button>
            <Radio.Button
              value="tu_van_dinh_duong"
              style={{ width: "50%", textAlign: "center" }}
            >
              <ShoppingCartOutlined style={{ marginRight: 8 }} />
              Tư vấn dinh dưỡng
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Chọn bệnh nhân */}
        <Form.Item
          label="Bệnh nhân"
          required
          rules={[{ required: true, message: "Vui lòng chọn bệnh nhân!" }]}
        >
          <Select
            placeholder="Chọn bệnh nhân"
            showSearch
            value={selectedPatient}
            onChange={(value) => setSelectedPatient(value)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
          >
            {patients.map((patient) => (
              <Option key={patient.id_benh_nhan} value={patient.id_benh_nhan}>
                {patient.ho_ten} - {patient.so_dien_thoai}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Chọn chuyên khoa (chỉ hiển thị khi chọn khám bệnh) */}
        {serviceType === "kham_benh" && (
          <Form.Item label="Chuyên khoa (tùy chọn)">
            <Select
              placeholder="Chọn chuyên khoa (để trống nếu không quan trọng)"
              value={selectedSpecialty}
              onChange={(value) => {
                setSelectedSpecialty(value);
                setSelectedDate(null);
                setAvailableTimeSlots([]);
                setSelectedTimeSlot(null);
              }}
              allowClear
              style={{ width: "100%" }}
            >
              {specialties.map((specialty) => (
                <Option
                  key={specialty.id_chuyen_khoa}
                  value={specialty.id_chuyen_khoa}
                >
                  {specialty.ten_chuyen_khoa}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Chọn loại hẹn */}
        <Form.Item label="Loại hẹn">
          <Radio.Group
            value={loaiHen}
            onChange={(e) => setLoaiHen(e.target.value)}
          >
            <Radio value="truc_tiep">Trực tiếp</Radio>
            <Radio value="online">Online</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Chọn ngày */}
        <Form.Item label="Ngày hẹn" required>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setSelectedTimeSlot(null);
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày hẹn"
            minDate={new Date()}
            className="form-control"
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Hiển thị khung giờ trống */}
        {selectedDate && availableTimeSlots.length > 0 && (
          <Form.Item label="Khung giờ trống" required>
            <div className="time-slots-container">
              {availableTimeSlots.map((slot) => (
                <Card
                  key={slot.id_khung_gio}
                  hoverable
                  onClick={() => setSelectedTimeSlot(slot.id_khung_gio)}
                  className={`time-slot-card ${
                    selectedTimeSlot === slot.id_khung_gio ? "selected" : ""
                  }`}
                  style={{
                    marginBottom: "12px",
                    border:
                      selectedTimeSlot === slot.id_khung_gio
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <ClockCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        <strong>
                          {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                        </strong>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {formatCaToDisplay(slot.ca)}
                        </Tag>
                      </div>
                      <Tag color="green">
                        {slot.availableSlots} chỗ trống
                      </Tag>
                    </div>
                    {serviceType === "kham_benh" && slot.ten_bac_si && (
                      <div style={{ color: "#595959", fontSize: "13px" }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        BS. {slot.ten_bac_si}
                        {slot.ten_chuyen_khoa && (
                          <span style={{ marginLeft: 8, color: "#8c8c8c" }}>
                            - {slot.ten_chuyen_khoa}
                          </span>
                        )}
                      </div>
                    )}
                    {serviceType === "tu_van_dinh_duong" && slot.ten_chuyen_gia && (
                      <div style={{ color: "#595959", fontSize: "13px" }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {slot.ten_chuyen_gia}
                      </div>
                    )}
                  </Space>
                </Card>
              ))}
            </div>
          </Form.Item>
        )}

        {selectedDate && loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Đang tải khung giờ trống...
          </div>
        )}

        {selectedDate && !loading && availableTimeSlots.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#8c8c8c",
              background: "#fafafa",
              borderRadius: "8px",
            }}
          >
            Không có khung giờ trống trong ngày này
          </div>
        )}

        {/* Lý do */}
        <Form.Item
          label={serviceType === "kham_benh" ? "Lý do khám" : "Lý do tư vấn"}
          required
        >
          <textarea
            className="form-control"
            rows={4}
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            placeholder={
              serviceType === "kham_benh"
                ? "Nhập lý do khám bệnh..."
                : "Nhập lý do tư vấn dinh dưỡng..."
            }
            style={{ width: "100%", resize: "vertical" }}
          />
        </Form.Item>

        {/* Buttons */}
        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={
                !selectedPatient ||
                !serviceType ||
                !selectedDate ||
                !selectedTimeSlot ||
                !lyDo
              }
            >
              <CalendarOutlined />
              Đặt lịch
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutoBookingModal;

