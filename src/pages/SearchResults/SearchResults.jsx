import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Tabs,
  Empty,
  Spin,
  Avatar,
  Tag,
  Button,
  Space,
  Divider,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import apiBacSi from "../../api/BacSi";
import apiChuyenGiaDinhDuong from "../../api/ChuyenGiaDinhDuong";
import apiChuyenKhoa from "../../api/ChuyenKhoa";
import apiDichVu from "../../api/DichVu";
import "./SearchResults.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchValue, setSearchValue] = useState(query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    bac_si: [],
    chuyen_gia: [],
    chuyen_khoa: [],
    dich_vu: [],
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults({
        bac_si: [],
        chuyen_gia: [],
        chuyen_khoa: [],
        dich_vu: [],
      });
      return;
    }

    setLoading(true);
    try {
      const [bacSiRes, chuyenGiaRes, chuyenKhoaRes, dichVuRes] =
        await Promise.allSettled([
          apiBacSi.getAll({ search: searchTerm }),
          apiChuyenGiaDinhDuong.getAll({ search: searchTerm }),
          apiChuyenKhoa.getAll(),
          apiDichVu.getAll(),
        ]);

      const bacSi =
        bacSiRes.status === "fulfilled" ? bacSiRes.value || [] : [];
      const chuyenGia =
        chuyenGiaRes.status === "fulfilled" ? chuyenGiaRes.value || [] : [];
      const chuyenKhoa =
        chuyenKhoaRes.status === "fulfilled" ? chuyenKhoaRes.value || [] : [];
      const dichVu =
        dichVuRes.status === "fulfilled" ? dichVuRes.value?.data || [] : [];

      // Filter client-side cho chuyên khoa và dịch vụ
      const filteredChuyenKhoa = chuyenKhoa.filter(
        (item) =>
          item.ten_chuyen_khoa
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const filteredDichVu = Array.isArray(dichVu)
        ? dichVu.filter(
            (item) =>
              item.ten_dich_vu
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              item.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

      // Filter client-side cho chuyên gia nếu API không hỗ trợ search
      const filteredChuyenGia = Array.isArray(chuyenGia)
        ? chuyenGia.filter(
            (item) =>
              item.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.chuyen_nganh_dinh_duong
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
        : [];

      setResults({
        bac_si: Array.isArray(bacSi) ? bacSi : [],
        chuyen_gia: filteredChuyenGia,
        chuyen_khoa: filteredChuyenKhoa,
        dich_vu: filteredDichVu,
      });
    } catch (error) {
      console.error("Error searching:", error);
      setResults({
        bac_si: [],
        chuyen_gia: [],
        chuyen_khoa: [],
        dich_vu: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleCardClick = (type, item) => {
    switch (type) {
      case "bac_si":
        navigate(`/doctors`);
        break;
      case "chuyen_gia":
        navigate(`/nutritionists`);
        break;
      case "chuyen_khoa":
        navigate(`/specialties`);
        break;
      case "dich_vu":
        navigate(`/services`);
        break;
      default:
        break;
    }
  };

  const renderDoctorCard = (doctor) => (
    <Card
      key={doctor.id_bac_si}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleCardClick("bac_si", doctor)}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            }}
          />
        </Col>
        <Col span={18}>
          <Title level={5} style={{ marginBottom: 8 }}>
            {doctor.ho_ten}
          </Title>
          {doctor.chuc_danh && (
            <Tag color="blue" style={{ marginBottom: 8 }}>
              {doctor.chuc_danh}
            </Tag>
          )}
          {doctor.ten_chuyen_khoa && (
            <Tag color="geekblue" style={{ marginBottom: 8 }}>
              {doctor.ten_chuyen_khoa}
            </Tag>
          )}
          {doctor.chuyen_mon && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, color: "#666" }}
            >
              {doctor.chuyen_mon}
            </Paragraph>
          )}
        </Col>
      </Row>
    </Card>
  );

  const renderNutritionistCard = (nutritionist) => (
    <Card
      key={nutritionist.id_chuyen_gia}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleCardClick("chuyen_gia", nutritionist)}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Avatar
            size={80}
            icon={<AppleOutlined />}
            style={{
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            }}
          />
        </Col>
        <Col span={18}>
          <Title level={5} style={{ marginBottom: 8 }}>
            {nutritionist.ho_ten}
          </Title>
          {nutritionist.chuyen_nganh_dinh_duong && (
            <Tag color="green" style={{ marginBottom: 8 }}>
              {nutritionist.chuyen_nganh_dinh_duong}
            </Tag>
          )}
          {nutritionist.so_nam_kinh_nghiem && (
            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              Kinh nghiệm: {nutritionist.so_nam_kinh_nghiem} năm
            </Text>
          )}
        </Col>
      </Row>
    </Card>
  );

  const renderSpecialtyCard = (specialty) => (
    <Card
      key={specialty.id_chuyen_khoa}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleCardClick("chuyen_khoa", specialty)}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Avatar
            size={80}
            icon={<MedicineBoxOutlined />}
            style={{
              background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
            }}
          />
        </Col>
        <Col span={18}>
          <Title level={5} style={{ marginBottom: 8 }}>
            {specialty.ten_chuyen_khoa}
          </Title>
          {specialty.mo_ta && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, color: "#666" }}
            >
              {specialty.mo_ta}
            </Paragraph>
          )}
        </Col>
      </Row>
    </Card>
  );

  const renderServiceCard = (service) => (
    <Card
      key={service.id_dich_vu}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleCardClick("dich_vu", service)}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Avatar
            size={80}
            icon={<CustomerServiceOutlined />}
            style={{
              background: "linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)",
            }}
          />
        </Col>
        <Col span={18}>
          <Title level={5} style={{ marginBottom: 8 }}>
            {service.ten_dich_vu}
          </Title>
          {service.gia && (
            <Tag color="purple" style={{ marginBottom: 8 }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(service.gia)}
            </Tag>
          )}
          {service.mo_ta && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, color: "#666" }}
            >
              {service.mo_ta}
            </Paragraph>
          )}
        </Col>
      </Row>
    </Card>
  );

  const totalResults =
    results.bac_si.length +
    results.chuyen_gia.length +
    results.chuyen_khoa.length +
    results.dich_vu.length;

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <Title level={2}>Kết quả tìm kiếm</Title>
        <Search
          placeholder="Tìm kiếm bác sĩ, chuyên gia, chuyên khoa, dịch vụ..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 600, marginBottom: 24 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : query ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary">
              Tìm thấy {totalResults} kết quả cho "{query}"
            </Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "all",
                label: `Tất cả (${totalResults})`,
                children: (
                  <div>
                    {results.bac_si.length > 0 && (
                      <div style={{ marginBottom: 32 }}>
                        <Title level={4}>
                          <UserOutlined /> Bác sĩ ({results.bac_si.length})
                        </Title>
                        <Divider />
                        {results.bac_si.map(renderDoctorCard)}
                      </div>
                    )}

                    {results.chuyen_gia.length > 0 && (
                      <div style={{ marginBottom: 32 }}>
                        <Title level={4}>
                          <AppleOutlined /> Chuyên gia dinh dưỡng (
                          {results.chuyen_gia.length})
                        </Title>
                        <Divider />
                        {results.chuyen_gia.map(renderNutritionistCard)}
                      </div>
                    )}

                    {results.chuyen_khoa.length > 0 && (
                      <div style={{ marginBottom: 32 }}>
                        <Title level={4}>
                          <MedicineBoxOutlined /> Chuyên khoa (
                          {results.chuyen_khoa.length})
                        </Title>
                        <Divider />
                        {results.chuyen_khoa.map(renderSpecialtyCard)}
                      </div>
                    )}

                    {results.dich_vu.length > 0 && (
                      <div style={{ marginBottom: 32 }}>
                        <Title level={4}>
                          <CustomerServiceOutlined /> Dịch vụ (
                          {results.dich_vu.length})
                        </Title>
                        <Divider />
                        {results.dich_vu.map(renderServiceCard)}
                      </div>
                    )}

                    {totalResults === 0 && (
                      <Empty
                        description="Không tìm thấy kết quả nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "bac_si",
                label: `Bác sĩ (${results.bac_si.length})`,
                children: (
                  <div>
                    {results.bac_si.length > 0 ? (
                      results.bac_si.map(renderDoctorCard)
                    ) : (
                      <Empty description="Không tìm thấy bác sĩ" />
                    )}
                  </div>
                ),
              },
              {
                key: "chuyen_gia",
                label: `Chuyên gia (${results.chuyen_gia.length})`,
                children: (
                  <div>
                    {results.chuyen_gia.length > 0 ? (
                      results.chuyen_gia.map(renderNutritionistCard)
                    ) : (
                      <Empty description="Không tìm thấy chuyên gia dinh dưỡng" />
                    )}
                  </div>
                ),
              },
              {
                key: "chuyen_khoa",
                label: `Chuyên khoa (${results.chuyen_khoa.length})`,
                children: (
                  <div>
                    {results.chuyen_khoa.length > 0 ? (
                      results.chuyen_khoa.map(renderSpecialtyCard)
                    ) : (
                      <Empty description="Không tìm thấy chuyên khoa" />
                    )}
                  </div>
                ),
              },
              {
                key: "dich_vu",
                label: `Dịch vụ (${results.dich_vu.length})`,
                children: (
                  <div>
                    {results.dich_vu.length > 0 ? (
                      results.dich_vu.map(renderServiceCard)
                    ) : (
                      <Empty description="Không tìm thấy dịch vụ" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </>
      ) : (
        <Empty
          description="Nhập từ khóa để tìm kiếm"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default SearchResults;

