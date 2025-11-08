import React, { useState, useEffect } from "react";
import { Card, Calendar, Badge, Typography, Tag, Row, Col, message } from "antd";
import { ClockCircleOutlined, ExperimentOutlined, CheckCircleOutlined } from "@ant-design/icons";
import apiChiDinhXetNghiem from "../../../api/ChiDinhXetNghiem";
import moment from "moment";

const { Title, Text } = Typography;

const LabStaffWorkSchedule = () => {
  const [testOrders, setTestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestOrders();
  }, []);

  const fetchTestOrders = async () => {
    try {
      setLoading(true);
      const data = await apiChiDinhXetNghiem.getAll();
      setTestOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching test orders:", error);
      message.error("Không thể tải dữ liệu lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayTests = testOrders.filter((test) => {
      const testDate = moment(test.thoi_gian_chi_dinh).format("YYYY-MM-DD");
      return testDate === dateStr;
    });

    return dayTests.map((test) => ({
      type: test.trang_thai === "hoan_thanh" ? "success" : "warning",
      content: `${test.ten_dich_vu} - ${test.nguoi_dung?.ho_ten || "N/A"}`,
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: 4 }}>
            <Badge
              status={item.type}
              text={
                <Text
                  ellipsis
                  style={{ fontSize: "12px" }}
                  title={item.content}
                >
                  {item.content}
                </Text>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const monthCellRender = (value) => {
    const monthStr = value.format("YYYY-MM");
    const monthTests = testOrders.filter((test) => {
      const testDate = moment(test.thoi_gian_chi_dinh).format("YYYY-MM");
      return testDate === monthStr;
    });

    if (monthTests.length === 0) return null;

    const completed = monthTests.filter((t) => t.trang_thai === "hoan_thanh").length;
    const pending = monthTests.filter((t) => t.trang_thai === "cho_xu_ly").length;

    return (
      <div style={{ padding: "8px 0" }}>
        <div>
          <Tag color="green">
            <CheckCircleOutlined /> {completed} hoàn thành
          </Tag>
        </div>
        <div>
          <Tag color="orange">
            <ClockCircleOutlined /> {pending} chờ xử lý
          </Tag>
        </div>
      </div>
    );
  };

  // Tính toán thống kê
  const today = moment();
  const todayTests = testOrders.filter((test) => {
    const testDate = moment(test.thoi_gian_chi_dinh).format("YYYY-MM-DD");
    return testDate === today.format("YYYY-MM-DD");
  });

  const thisWeekTests = testOrders.filter((test) => {
    const testDate = moment(test.thoi_gian_chi_dinh);
    return testDate.isSame(today, "week");
  });

  const thisMonthTests = testOrders.filter((test) => {
    const testDate = moment(test.thoi_gian_chi_dinh);
    return testDate.isSame(today, "month");
  });

  return (
    <div>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Lịch làm việc
      </Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <ExperimentOutlined style={{ fontSize: "32px", color: "#1890ff", marginBottom: "8px" }} />
              <div>
                <Text type="secondary">Hôm nay</Text>
                <br />
                <Text strong style={{ fontSize: "24px" }}>
                  {todayTests.length} chỉ định
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined style={{ fontSize: "32px", color: "#52c41a", marginBottom: "8px" }} />
              <div>
                <Text type="secondary">Tuần này</Text>
                <br />
                <Text strong style={{ fontSize: "24px" }}>
                  {thisWeekTests.length} chỉ định
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <ExperimentOutlined style={{ fontSize: "32px", color: "#722ed1", marginBottom: "8px" }} />
              <div>
                <Text type="secondary">Tháng này</Text>
                <br />
                <Text strong style={{ fontSize: "24px" }}>
                  {thisMonthTests.length} chỉ định
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Calendar */}
      <Card>
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default LabStaffWorkSchedule;

