import React from "react";
import { Layout, Typography, Card, Divider, Space, Tag, Row, Col, Timeline } from "antd";
import {
  SafetyOutlined,
  LockOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  UserOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./PrivacyPolicy.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const PrivacyPolicy = () => {
  return (
    <Layout className="privacy-policy-layout">
      <Content className="privacy-policy-content">
        {/* Hero Section */}
        <div className="privacy-hero-section">
          <div className="privacy-hero-content">
            <Space direction="vertical" size="large" align="center">
              <div className="privacy-hero-icon">
                <SafetyOutlined style={{ fontSize: 80, color: "#1890ff" }} />
              </div>
              <Title level={1} className="privacy-hero-title">
                Chính Sách Bảo Mật
              </Title>
              <Text className="privacy-hero-subtitle">
                Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn
              </Text>
              <Tag color="blue" style={{ fontSize: 14, padding: "4px 16px" }}>
                Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
              </Tag>
            </Space>
          </div>
        </div>

        {/* Main Content */}
        <div className="privacy-main-container">
          <Row gutter={[32, 32]}>
            {/* Sidebar Navigation */}
            <Col xs={24} lg={6}>
              <Card className="privacy-sidebar">
                <Title level={4}>
                  <FileProtectOutlined style={{ marginRight: 8 }} />
                  Mục lục
                </Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <a href="#introduction" className="privacy-nav-link">
                    Giới thiệu
                  </a>
                  <a href="#data-collection" className="privacy-nav-link">
                    Thu thập thông tin
                  </a>
                  <a href="#data-usage" className="privacy-nav-link">
                    Sử dụng thông tin
                  </a>
                  <a href="#data-protection" className="privacy-nav-link">
                    Bảo vệ thông tin
                  </a>
                  <a href="#user-rights" className="privacy-nav-link">
                    Quyền của người dùng
                  </a>
                  <a href="#cookies" className="privacy-nav-link">
                    Cookies
                  </a>
                  <a href="#third-party" className="privacy-nav-link">
                    Bên thứ ba
                  </a>
                  <a href="#changes" className="privacy-nav-link">
                    Thay đổi chính sách
                  </a>
                  <a href="#contact" className="privacy-nav-link">
                    Liên hệ
                  </a>
                </Space>
              </Card>
            </Col>

            {/* Main Content */}
            <Col xs={24} lg={18}>
              <div className="privacy-content-wrapper">
                {/* Introduction */}
                <Card id="introduction" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <GlobalOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      1. Giới thiệu
                    </Title>
                    <Paragraph>
                      Chào mừng bạn đến với <strong>HOSPITAL CARE CENTER</strong>. Chúng tôi cam kết bảo vệ 
                      quyền riêng tư và thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách 
                      chúng tôi thu thập, sử dụng, bảo vệ và chia sẻ thông tin của bạn khi sử dụng dịch vụ 
                      của chúng tôi.
                    </Paragraph>
                    <Paragraph>
                      Bằng cách sử dụng trang web và dịch vụ của chúng tôi, bạn đồng ý với việc thu thập và 
                      sử dụng thông tin theo mô tả trong chính sách này.
                    </Paragraph>
                  </Space>
                </Card>

                {/* Data Collection */}
                <Card id="data-collection" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <UserOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      2. Thông tin chúng tôi thu thập
                    </Title>
                    <Paragraph>
                      Chúng tôi thu thập các loại thông tin sau để cung cấp và cải thiện dịch vụ của chúng tôi:
                    </Paragraph>

                    <div className="privacy-info-box">
                      <Title level={4}>
                        <CheckCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                        Thông tin cá nhân
                      </Title>
                      <ul className="privacy-list">
                        <li>Họ và tên</li>
                        <li>Ngày sinh</li>
                        <li>Số điện thoại</li>
                        <li>Địa chỉ email</li>
                        <li>Địa chỉ nhà</li>
                        <li>Số CMND/CCCD/Passport</li>
                        <li>Thông tin bảo hiểm y tế (BHYT)</li>
                      </ul>
                    </div>

                    <div className="privacy-info-box">
                      <Title level={4}>
                        <CheckCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                        Thông tin y tế
                      </Title>
                      <ul className="privacy-list">
                        <li>Tiền sử bệnh lý</li>
                        <li>Tình trạng sức khỏe hiện tại</li>
                        <li>Lịch sử khám bệnh</li>
                        <li>Kết quả xét nghiệm</li>
                        <li>Đơn thuốc và điều trị</li>
                      </ul>
                    </div>

                    <div className="privacy-info-box">
                      <Title level={4}>
                        <CheckCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                        Thông tin tự động thu thập
                      </Title>
                      <ul className="privacy-list">
                        <li>Địa chỉ IP</li>
                        <li>Loại trình duyệt và thiết bị</li>
                        <li>Thông tin về cách bạn sử dụng trang web</li>
                        <li>Cookies và công nghệ theo dõi tương tự</li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Data Usage */}
                <Card id="data-usage" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <SecurityScanOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      3. Cách chúng tôi sử dụng thông tin
                    </Title>
                    <Paragraph>
                      Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
                    </Paragraph>

                    <Timeline
                      items={[
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Cung cấp dịch vụ y tế</Title>
                              <Text>
                                Để đặt lịch khám, tư vấn, quản lý hồ sơ bệnh án và cung cấp các dịch vụ 
                                chăm sóc sức khỏe.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Liên lạc với bạn</Title>
                              <Text>
                                Để gửi thông báo về lịch hẹn, kết quả khám, nhắc nhở uống thuốc và các 
                                thông tin y tế quan trọng khác.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Cải thiện dịch vụ</Title>
                              <Text>
                                Để phân tích xu hướng sử dụng, cải thiện trang web và dịch vụ của chúng tôi.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Tuân thủ pháp luật</Title>
                              <Text>
                                Để tuân thủ các yêu cầu pháp lý và quy định về y tế.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>An toàn và bảo mật</Title>
                              <Text>
                                Để phát hiện và ngăn chặn các hoạt động gian lận, lạm dụng hoặc vi phạm.
                              </Text>
                            </>
                          ),
                        },
                      ]}
                    />
                  </Space>
                </Card>

                {/* Data Protection */}
                <Card id="data-protection" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <LockOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      4. Bảo vệ thông tin
                    </Title>
                    <Paragraph>
                      Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ 
                      thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát, thay đổi hoặc tiết lộ.
                    </Paragraph>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card className="protection-feature-card">
                          <SafetyOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }} />
                          <Title level={4}>Mã hóa dữ liệu</Title>
                          <Text>
                            Tất cả dữ liệu được mã hóa bằng công nghệ SSL/TLS khi truyền tải qua mạng.
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="protection-feature-card">
                          <SafetyOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }} />
                          <Title level={4}>Truy cập có kiểm soát</Title>
                          <Text>
                            Chỉ nhân viên được ủy quyền mới có thể truy cập thông tin cá nhân của bạn.
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="protection-feature-card">
                          <SecurityScanOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }} />
                          <Title level={4}>Giám sát an ninh</Title>
                          <Text>
                            Hệ thống được giám sát 24/7 để phát hiện và ngăn chặn các mối đe dọa bảo mật.
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="protection-feature-card">
                          <FileProtectOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }} />
                          <Title level={4}>Sao lưu định kỳ</Title>
                          <Text>
                            Dữ liệu được sao lưu định kỳ và lưu trữ an toàn để đảm bảo tính toàn vẹn.
                          </Text>
                        </Card>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                {/* User Rights */}
                <Card id="user-rights" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <UserOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      5. Quyền của người dùng
                    </Title>
                    <Paragraph>
                      Bạn có các quyền sau đây liên quan đến thông tin cá nhân của mình:
                    </Paragraph>

                    <div className="privacy-rights-grid">
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền truy cập</Title>
                          <Text>Xem và sao chép thông tin cá nhân của bạn</Text>
                        </div>
                      </div>
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền chỉnh sửa</Title>
                          <Text>Cập nhật hoặc sửa đổi thông tin cá nhân không chính xác</Text>
                        </div>
                      </div>
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền xóa</Title>
                          <Text>Yêu cầu xóa thông tin cá nhân của bạn (trong giới hạn pháp luật)</Text>
                        </div>
                      </div>
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền từ chối</Title>
                          <Text>Từ chối việc xử lý thông tin cá nhân cho một số mục đích nhất định</Text>
                        </div>
                      </div>
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền di chuyển dữ liệu</Title>
                          <Text>Yêu cầu chuyển thông tin cá nhân của bạn sang nhà cung cấp khác</Text>
                        </div>
                      </div>
                      <div className="right-item">
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                        <div>
                          <Title level={5}>Quyền khiếu nại</Title>
                          <Text>Khiếu nại với cơ quan quản lý về việc xử lý dữ liệu</Text>
                        </div>
                      </div>
                    </div>
                  </Space>
                </Card>

                {/* Cookies */}
                <Card id="cookies" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <GlobalOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      6. Cookies và Công nghệ theo dõi
                    </Title>
                    <Paragraph>
                      Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm của bạn, 
                      phân tích cách bạn sử dụng trang web và hỗ trợ các hoạt động tiếp thị.
                    </Paragraph>
                    <Paragraph>
                      <strong>Loại cookies chúng tôi sử dụng:</strong>
                    </Paragraph>
                    <ul className="privacy-list">
                      <li>
                        <strong>Cookies cần thiết:</strong> Để trang web hoạt động đúng cách
                      </li>
                      <li>
                        <strong>Cookies hiệu suất:</strong> Để thu thập thông tin về cách bạn sử dụng trang web
                      </li>
                      <li>
                        <strong>Cookies chức năng:</strong> Để nhớ các lựa chọn của bạn và cải thiện trải nghiệm
                      </li>
                      <li>
                        <strong>Cookies quảng cáo:</strong> Để hiển thị quảng cáo phù hợp với bạn
                      </li>
                    </ul>
                    <Paragraph>
                      Bạn có thể quản lý hoặc xóa cookies thông qua cài đặt trình duyệt của mình.
                    </Paragraph>
                  </Space>
                </Card>

                {/* Third Party */}
                <Card id="third-party" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <SecurityScanOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      7. Chia sẻ thông tin với bên thứ ba
                    </Title>
                    <Paragraph>
                      Chúng tôi có thể chia sẻ thông tin của bạn với các bên sau trong các trường hợp sau:
                    </Paragraph>

                    <div className="privacy-info-box warning">
                      <Title level={4}>⚠️ Các trường hợp chia sẻ:</Title>
                      <ul className="privacy-list">
                        <li>
                          <strong>Nhà cung cấp dịch vụ:</strong> Các công ty hỗ trợ hoạt động của chúng tôi 
                          (lưu trữ dữ liệu, thanh toán, phân tích)
                        </li>
                        <li>
                          <strong>Bác sĩ và nhân viên y tế:</strong> Để cung cấp dịch vụ chăm sóc sức khỏe
                        </li>
                        <li>
                          <strong>Yêu cầu pháp luật:</strong> Khi được yêu cầu bởi cơ quan pháp luật
                        </li>
                        <li>
                          <strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền, tài sản hoặc an toàn của chúng tôi 
                          hoặc người khác
                        </li>
                        <li>
                          <strong>Chuyển giao kinh doanh:</strong> Trong trường hợp sáp nhập, mua lại hoặc bán tài sản
                        </li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Changes */}
                <Card id="changes" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <FileProtectOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      8. Thay đổi chính sách bảo mật
                    </Title>
                    <Paragraph>
                      Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi quan trọng 
                      sẽ được thông báo qua email hoặc thông báo trên trang web.
                    </Paragraph>
                    <Paragraph>
                      Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ để cập nhật về cách chúng tôi 
                      bảo vệ thông tin của bạn.
                    </Paragraph>
                  </Space>
                </Card>

                {/* Contact */}
                <Card id="contact" className="privacy-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <GlobalOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      9. Liên hệ với chúng tôi
                    </Title>
                    <Paragraph>
                      Nếu bạn có câu hỏi, lo ngại hoặc yêu cầu liên quan đến chính sách bảo mật này hoặc cách 
                      chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi:
                    </Paragraph>

                    <div className="privacy-contact-info">
                      <Card className="contact-card">
                        <Title level={4}>HOSPITAL CARE CENTER</Title>
                        <Space direction="vertical" size="small">
                          <Text>
                            <strong>Email:</strong> privacy@hospitalcarecenter.com
                          </Text>
                          <Text>
                            <strong>Điện thoại:</strong> 1900 123 456
                          </Text>
                          <Text>
                            <strong>Địa chỉ:</strong> 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                          </Text>
                          <Text>
                            <strong>Giờ làm việc:</strong> Thứ 2 - CN: 7:00 - 20:00
                          </Text>
                        </Space>
                      </Card>
                    </div>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default PrivacyPolicy;

