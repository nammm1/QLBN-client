import React, { useRef, useEffect } from "react";
import { List, Typography, Empty, Spin, Avatar } from "antd";
import {
  UserOutlined,
  AppleOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const SearchDropdown = ({ results, loading, visible, onItemClick }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Prevent dropdown from closing when clicking inside it
  // Must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".header-search")
      ) {
        // This will be handled by parent component
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible]);

  if (!visible) return null;

  const handleItemClick = (type, item) => {
    if (onItemClick) {
      onItemClick();
    }

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

  const getIcon = (type) => {
    switch (type) {
      case "bac_si":
        return <UserOutlined style={{ color: "#1890ff" }} />;
      case "chuyen_gia":
        return <AppleOutlined style={{ color: "#096dd9" }} />;
      case "chuyen_khoa":
        return <MedicineBoxOutlined style={{ color: "#faad14" }} />;
      case "dich_vu":
        return <CustomerServiceOutlined style={{ color: "#eb2f96" }} />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "bac_si":
        return "Bác sĩ";
      case "chuyen_gia":
        return "Chuyên gia dinh dưỡng";
      case "chuyen_khoa":
        return "Chuyên khoa";
      case "dich_vu":
        return "Dịch vụ";
      default:
        return "";
    }
  };

  const hasResults =
    results.bac_si?.length > 0 ||
    results.chuyen_gia?.length > 0 ||
    results.chuyen_khoa?.length > 0 ||
    results.dich_vu?.length > 0;

  if (loading) {
  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: 8,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        padding: 16,
        minHeight: 100,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 8,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          padding: 16,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy kết quả"
        />
      </div>
    );
  }

  const allResults = [
    ...(results.bac_si?.slice(0, 3).map((item) => ({
      ...item,
      type: "bac_si",
      title: item.ho_ten,
      subtitle: item.chuyen_mon || item.ten_chuyen_khoa,
    })) || []),
    ...(results.chuyen_gia?.slice(0, 3).map((item) => ({
      ...item,
      type: "chuyen_gia",
      title: item.ho_ten,
      subtitle: item.chuyen_nganh_dinh_duong,
    })) || []),
    ...(results.chuyen_khoa?.slice(0, 3).map((item) => ({
      ...item,
      type: "chuyen_khoa",
      title: item.ten_chuyen_khoa,
      subtitle: item.mo_ta,
    })) || []),
    ...(results.dich_vu?.slice(0, 3).map((item) => ({
      ...item,
      type: "dich_vu",
      title: item.ten_dich_vu,
      subtitle: item.mo_ta,
    })) || []),
  ];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: 8,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        maxHeight: 400,
        overflowY: "auto",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <List
        dataSource={allResults}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => handleItemClick(item.type, item)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={getIcon(item.type)}
                  style={{
                    background: "transparent",
                  }}
                />
              }
              title={
                <div>
                  <Text strong>{item.title}</Text>
                  <Text
                    type="secondary"
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      padding: "2px 8px",
                      background: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    {getTypeLabel(item.type)}
                  </Text>
                </div>
              }
              description={
                <Text
                  type="secondary"
                  ellipsis
                  style={{ fontSize: 12, maxWidth: 300 }}
                >
                  {item.subtitle || "Không có mô tả"}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default SearchDropdown;

