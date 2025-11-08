import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Timeline, Table, Tag, Avatar, Typography, Badge, Spin, message } from "antd";
import {
  ExperimentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import apiChiDinhXetNghiem from "../../../api/ChiDinhXetNghiem";
import moment from "moment";

const { Title, Text } = Typography;

const LabStaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedToday: 0,
    totalToday: 0,
    completionRate: 0,
  });

  const [recentTests, setRecentTests] = useState([]);
  const [pendingTests, setPendingTests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả chỉ định xét nghiệm
      const allTests = await apiChiDinhXetNghiem.getAll();
      
      if (!Array.isArray(allTests)) {
        message.error("Không thể tải dữ liệu");
        return;
      }

      const today = moment().format("YYYY-MM-DD");
      
      // Tính toán thống kê
      const pending = allTests.filter(t => t.trang_thai === 'cho_xu_ly');
      const completed = allTests.filter(t => t.trang_thai === 'hoan_thanh');
      const todayTests = allTests.filter(t => {
        const testDate = moment(t.thoi_gian_chi_dinh).format("YYYY-MM-DD");
        return testDate === today;
      });
      const completedToday = todayTests.filter(t => t.trang_thai === 'hoan_thanh');
      
      const completionRate = todayTests.length > 0 
        ? Math.round((completedToday.length / todayTests.length) * 100) 
        : 0;

      setStats({
        pendingTests: pending.length,
        completedToday: completedToday.length,
        totalToday: todayTests.length,
        completionRate,
      });

      // Lấy 5 chỉ định gần đây nhất
      const sortedRecent = [...allTests]
        .sort((a, b) => new Date(b.thoi_gian_chi_dinh) - new Date(a.thoi_gian_chi_dinh))
        .slice(0, 5);
      setRecentTests(sortedRecent);

      // Lấy 5 chỉ định đang chờ xử lý
      const sortedPending = [...pending]
        .sort((a, b) => new Date(a.thoi_gian_chi_dinh) - new Date(b.thoi_gian_chi_dinh))
        .slice(0, 5);
      setPendingTests(sortedPending);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    return moment(dateTime).format("DD/MM/YYYY HH:mm");
  };

  const getStatusTag = (trangThai) => {
    const statusMap = {
      cho_xu_ly: { color: "orange", text: "Chờ xử lý" },
      hoan_thanh: { color: "green", text: "Hoàn thành" },
      da_huy: { color: "red", text: "Đã hủy" },
    };
    const status = statusMap[trangThai] || { color: "default", text: trangThai };
    return <Tag color={status.color}>{status.text}</Tag>;
  };

  const pendingColumns = [
    {
      title: "Bệnh nhân",
      dataIndex: "nguoi_dung",
      key: "nguoi_dung",
      render: (nguoiDung) => nguoiDung?.ho_ten || "N/A",
    },
    {
      title: "Dịch vụ",
      dataIndex: "ten_dich_vu",
      key: "ten_dich_vu",
    },
    {
      title: "Bác sĩ chỉ định",
      dataIndex: "bac_si_nguoi_dung",
      key: "bac_si",
      render: (bacSi) => bacSi?.ho_ten || "N/A",
    },
    {
      title: "Thời gian chỉ định",
      dataIndex: "thoi_gian_chi_dinh",
      key: "thoi_gian_chi_dinh",
      render: (time) => formatDateTime(time),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => getStatusTag(status),
    },
  ];

  const recentColumns = [
    ...pendingColumns,
    {
      title: "Kết quả",
      key: "ket_qua",
      render: (_, record) => record.ket_qua ? (
        <Tag color="green">Đã có kết quả</Tag>
      ) : (
        <Tag color="orange">Chưa có kết quả</Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Tổng quan - Nhân viên Xét nghiệm
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={stats.pendingTests}
              prefix={<SyncOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành hôm nay"
              value={stats.completedToday}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hôm nay"
              value={stats.totalToday}
              prefix={<ExperimentOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={stats.completionRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Pending Tests */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <SyncOutlined style={{ marginRight: "8px", color: "#faad14" }} />
                Chỉ định đang chờ xử lý
              </span>
            }
            extra={
              <Badge count={pendingTests.length} style={{ backgroundColor: "#faad14" }} />
            }
          >
            <Table
              dataSource={pendingTests}
              columns={pendingColumns}
              rowKey="id_chi_dinh"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>

        {/* Recent Tests */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                Chỉ định gần đây
              </span>
            }
          >
            <Table
              dataSource={recentTests}
              columns={recentColumns}
              rowKey="id_chi_dinh"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LabStaffDashboard;

