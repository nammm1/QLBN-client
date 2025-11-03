import React from "react";
import { Layout, Typography, Card, Divider, Space, Tag, Row, Col, Alert, Timeline } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UserOutlined,
  GlobalOutlined,
  LockOutlined,
  SafetyOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./TermsOfUse.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const TermsOfUse = () => {
  return (
    <Layout className="terms-layout">
      <Content className="terms-content">
        {/* Hero Section */}
        <div className="terms-hero-section">
          <div className="terms-hero-content">
            <Space direction="vertical" size="large" align="center">
              <div className="terms-hero-icon">
                <FileTextOutlined style={{ fontSize: 80, color: "#1890ff" }} />
              </div>
              <Title level={1} className="terms-hero-title">
                Điều Khoản Sử Dụng
              </Title>
              <Text className="terms-hero-subtitle">
                Đọc kỹ các điều khoản trước khi sử dụng dịch vụ của chúng tôi
              </Text>
              <Tag color="blue" style={{ fontSize: 14, padding: "4px 16px" }}>
                Có hiệu lực từ: {new Date().toLocaleDateString("vi-VN")}
              </Tag>
            </Space>
          </div>
        </div>

        {/* Main Content */}
        <div className="terms-main-container">
          <Row gutter={[32, 32]}>
            {/* Sidebar Navigation */}
            <Col xs={24} lg={6}>
              <Card className="terms-sidebar">
                <Title level={4}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  Mục lục
                </Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <a href="#acceptance" className="terms-nav-link">
                    Chấp nhận điều khoản
                  </a>
                  <a href="#services" className="terms-nav-link">
                    Dịch vụ cung cấp
                  </a>
                  <a href="#account" className="terms-nav-link">
                    Tài khoản người dùng
                  </a>
                  <a href="#usage-rules" className="terms-nav-link">
                    Quy tắc sử dụng
                  </a>
                  <a href="#booking" className="terms-nav-link">
                    Đặt lịch khám
                  </a>
                  <a href="#payment" className="terms-nav-link">
                    Thanh toán
                  </a>
                  <a href="#cancellation" className="terms-nav-link">
                    Hủy và hoàn tiền
                  </a>
                  <a href="#liability" className="terms-nav-link">
                    Trách nhiệm
                  </a>
                  <a href="#intellectual" className="terms-nav-link">
                    Sở hữu trí tuệ
                  </a>
                  <a href="#termination" className="terms-nav-link">
                    Chấm dứt dịch vụ
                  </a>
                  <a href="#changes" className="terms-nav-link">
                    Thay đổi điều khoản
                  </a>
                  <a href="#contact" className="terms-nav-link">
                    Liên hệ
                  </a>
                </Space>
              </Card>
            </Col>

            {/* Main Content */}
            <Col xs={24} lg={18}>
              <div className="terms-content-wrapper">
                {/* Acceptance Alert */}
                <Alert
                  message="Quan trọng"
                  description="Bằng cách sử dụng trang web và dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu trong tài liệu này."
                  type="warning"
                  icon={<WarningOutlined />}
                  showIcon
                  style={{ marginBottom: 32, borderRadius: 8 }}
                />

                {/* Acceptance */}
                <Card id="acceptance" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <CheckCircleOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      1. Chấp nhận điều khoản
                    </Title>
                    <Paragraph>
                      Chào mừng bạn đến với <strong>HOSPITAL CARE CENTER</strong>. Khi bạn truy cập và 
                      sử dụng trang web hoặc các dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản 
                      và điều kiện này.
                    </Paragraph>
                    <Paragraph>
                      Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được sử dụng 
                      dịch vụ của chúng tôi.
                    </Paragraph>
                    <div className="terms-info-box">
                      <InfoCircleOutlined style={{ fontSize: 24, color: "#1890ff", marginRight: 12 }} />
                      <div>
                        <Title level={5}>Bạn phải:</Title>
                        <ul className="terms-list">
                          <li>Đọc kỹ tất cả các điều khoản trước khi sử dụng dịch vụ</li>
                          <li>Tuân thủ mọi quy tắc và quy định được nêu ra</li>
                          <li>Cung cấp thông tin chính xác và cập nhật</li>
                          <li>Giữ bảo mật thông tin tài khoản của bạn</li>
                        </ul>
                      </div>
                    </div>
                  </Space>
                </Card>

                {/* Services */}
                <Card id="services" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <GlobalOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      2. Dịch vụ cung cấp
                    </Title>
                    <Paragraph>
                      <strong>HOSPITAL CARE CENTER</strong> cung cấp các dịch vụ y tế và chăm sóc sức khỏe 
                      thông qua nền tảng trực tuyến, bao gồm:
                    </Paragraph>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card className="service-feature-card">
                          <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 16 }} />
                          <Title level={4}>Đặt lịch khám</Title>
                          <Text>
                            Đặt lịch khám trực tiếp tại bệnh viện với bác sĩ chuyên khoa
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="service-feature-card">
                          <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 16 }} />
                          <Title level={4}>Tư vấn trực tuyến</Title>
                          <Text>
                            Tư vấn sức khỏe và dinh dưỡng qua video call với chuyên gia
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="service-feature-card">
                          <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 16 }} />
                          <Title level={4}>Quản lý hồ sơ</Title>
                          <Text>
                            Xem và quản lý hồ sơ bệnh án, kết quả xét nghiệm trực tuyến
                          </Text>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="service-feature-card">
                          <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 16 }} />
                          <Title level={4}>Nhắn tin với bác sĩ</Title>
                          <Text>
                            Liên lạc trực tiếp với bác sĩ và nhân viên y tế qua hệ thống chat
                          </Text>
                        </Card>
                      </Col>
                    </Row>

                    <Alert
                      message="Lưu ý"
                      description="Chúng tôi bảo lưu quyền thay đổi, tạm ngưng hoặc chấm dứt bất kỳ dịch vụ nào mà không cần thông báo trước."
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </Space>
                </Card>

                {/* Account */}
                <Card id="account" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <UserOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      3. Tài khoản người dùng
                    </Title>
                    <Paragraph>
                      Để sử dụng một số dịch vụ, bạn cần tạo tài khoản. Bạn có trách nhiệm:
                    </Paragraph>

                    <Timeline
                      items={[
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Cung cấp thông tin chính xác</Title>
                              <Text>
                                Cung cấp thông tin cá nhân chính xác, đầy đủ và cập nhật khi đăng ký 
                                tài khoản.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Bảo mật thông tin đăng nhập</Title>
                              <Text>
                                Giữ bảo mật mật khẩu và thông tin đăng nhập. Bạn chịu trách nhiệm cho 
                                mọi hoạt động xảy ra dưới tài khoản của bạn.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Một tài khoản cho mỗi người</Title>
                              <Text>
                                Mỗi người chỉ được phép có một tài khoản. Không được chia sẻ tài khoản 
                                với người khác.
                              </Text>
                            </>
                          ),
                        },
                        {
                          color: "blue",
                          children: (
                            <>
                              <Title level={5}>Thông báo vi phạm</Title>
                              <Text>
                                Thông báo ngay lập tức cho chúng tôi nếu bạn phát hiện bất kỳ hoạt động 
                                trái phép nào trên tài khoản của mình.
                              </Text>
                            </>
                          ),
                        },
                      ]}
                    />
                  </Space>
                </Card>

                {/* Usage Rules */}
                <Card id="usage-rules" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <SafetyOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      4. Quy tắc sử dụng
                    </Title>
                    <Paragraph>
                      Khi sử dụng dịch vụ của chúng tôi, bạn <strong>KHÔNG ĐƯỢC:</strong>
                    </Paragraph>

                    <div className="terms-warning-box">
                      <WarningOutlined style={{ fontSize: 32, color: "#ff4d4f", marginBottom: 16 }} />
                      <ul className="terms-list prohibited">
                        <li>Cung cấp thông tin giả mạo hoặc sai lệch</li>
                        <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                        <li>Xâm phạm quyền riêng tư của người khác</li>
                        <li>Phát tán virus, malware hoặc mã độc hại</li>
                        <li>Cố gắng hack hoặc xâm nhập hệ thống</li>
                        <li>Spam hoặc gửi tin nhắn không mong muốn</li>
                        <li>Sử dụng bot hoặc công cụ tự động để tấn công hệ thống</li>
                        <li>Sao chép, sửa đổi hoặc phân phối nội dung của chúng tôi mà không được phép</li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Booking */}
                <Card id="booking" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <CheckCircleOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      5. Đặt lịch khám
                    </Title>
                    <Paragraph>
                      Khi đặt lịch khám hoặc tư vấn, bạn đồng ý với các điều khoản sau:
                    </Paragraph>

                    <div className="terms-info-box">
                      <Title level={4}>Quy trình đặt lịch:</Title>
                      <ol className="terms-list ordered">
                        <li>Chọn dịch vụ, bác sĩ/chuyên gia và thời gian phù hợp</li>
                        <li>Cung cấp thông tin cá nhân và y tế cần thiết</li>
                        <li>Xác nhận và thanh toán (nếu có)</li>
                        <li>Nhận xác nhận đặt lịch qua email/SMS</li>
                        <li>Đến đúng giờ hẹn hoặc tham gia cuộc gọi video đúng giờ</li>
                      </ol>
                    </div>

                    <Alert
                      message="Lưu ý quan trọng"
                      description="Nếu bạn không đến hoặc tham gia đúng giờ, chúng tôi có quyền hủy lịch hẹn và có thể áp dụng chính sách hủy/huỷ tiền tương ứng."
                      type="warning"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </Space>
                </Card>

                {/* Payment */}
                <Card id="payment" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <CheckCircleOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      6. Thanh toán
                    </Title>
                    <Paragraph>
                      Bạn có thể thanh toán cho dịch vụ thông qua các phương thức sau:
                    </Paragraph>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card className="payment-method-card">
                          <Title level={5}>💳 Thẻ tín dụng/ghi nợ</Title>
                          <Text>Visa, Mastercard, JCB</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card className="payment-method-card">
                          <Title level={5}>📱 Ví điện tử</Title>
                          <Text>Momo, ZaloPay, VNPay</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card className="payment-method-card">
                          <Title level={5}>🏦 Chuyển khoản</Title>
                          <Text>Ngân hàng, Internet Banking</Text>
                        </Card>
                      </Col>
                    </Row>

                    <div className="terms-info-box">
                      <Title level={5}>Thông tin thanh toán:</Title>
                      <ul className="terms-list">
                        <li>Giá cả được hiển thị rõ ràng trước khi bạn xác nhận đặt lịch</li>
                        <li>Thanh toán được xử lý an toàn qua cổng thanh toán bảo mật</li>
                        <li>Bạn sẽ nhận được hóa đơn điện tử sau khi thanh toán thành công</li>
                        <li>Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn</li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Cancellation */}
                <Card id="cancellation" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <QuestionCircleOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      7. Hủy và hoàn tiền
                    </Title>
                    <Paragraph>
                      <strong>Chính sách hủy lịch hẹn:</strong>
                    </Paragraph>

                    <div className="terms-info-box">
                      <Title level={5}>Thời gian hủy:</Title>
                      <ul className="terms-list">
                        <li>
                          <strong>Hủy trước 24 giờ:</strong> Hoàn tiền 100%
                        </li>
                        <li>
                          <strong>Hủy trước 12-24 giờ:</strong> Hoàn tiền 50%
                        </li>
                        <li>
                          <strong>Hủy sau 12 giờ hoặc không đến:</strong> Không hoàn tiền
                        </li>
                      </ul>
                    </div>

                    <div className="terms-info-box warning">
                      <Title level={5}>Lưu ý:</Title>
                      <ul className="terms-list">
                        <li>Thời gian hủy được tính từ thời điểm bạn gửi yêu cầu hủy</li>
                        <li>Tiền hoàn sẽ được chuyển lại trong vòng 5-7 ngày làm việc</li>
                        <li>Trong trường hợp khẩn cấp, vui lòng liên hệ trực tiếp để được xử lý</li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Liability */}
                <Card id="liability" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <WarningOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      8. Trách nhiệm và giới hạn
                    </Title>
                    <Paragraph>
                      <strong>Trách nhiệm của chúng tôi:</strong>
                    </Paragraph>
                    <ul className="terms-list">
                      <li>Cung cấp dịch vụ y tế chất lượng cao với đội ngũ chuyên nghiệp</li>
                      <li>Bảo mật thông tin cá nhân và y tế của bạn</li>
                      <li>Duy trì hệ thống hoạt động ổn định và an toàn</li>
                    </ul>

                    <Paragraph style={{ marginTop: 24 }}>
                      <strong>Giới hạn trách nhiệm:</strong>
                    </Paragraph>
                    <div className="terms-warning-box">
                      <ul className="terms-list">
                        <li>
                          Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp nào phát sinh 
                          từ việc sử dụng dịch vụ
                        </li>
                        <li>
                          Chúng tôi không đảm bảo dịch vụ sẽ luôn hoạt động không gián đoạn hoặc không có lỗi
                        </li>
                        <li>
                          Mọi quyết định y tế cuối cùng thuộc về bác sĩ và bệnh nhân, không phải nền tảng
                        </li>
                        <li>
                          Chúng tôi không chịu trách nhiệm cho việc mất mát dữ liệu do lỗi kỹ thuật hoặc 
                          hành vi của bên thứ ba
                        </li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                {/* Intellectual Property */}
                <Card id="intellectual" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <LockOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      9. Sở hữu trí tuệ
                    </Title>
                    <Paragraph>
                      Tất cả nội dung trên trang web, bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, 
                      hình ảnh, âm thanh, video, phần mềm và mã nguồn, đều là tài sản của 
                      <strong> HOSPITAL CARE CENTER</strong> hoặc được cấp phép sử dụng.
                    </Paragraph>
                    <Paragraph>
                      Bạn <strong>KHÔNG ĐƯỢC:</strong>
                    </Paragraph>
                    <ul className="terms-list prohibited">
                      <li>Sao chép, sửa đổi, phân phối hoặc sử dụng thương mại bất kỳ nội dung nào mà không được phép</li>
                      <li>Sử dụng thương hiệu, logo hoặc nhãn hiệu của chúng tôi mà không có sự cho phép bằng văn bản</li>
                      <li>Đảo ngược kỹ thuật hoặc cố gắng trích xuất mã nguồn</li>
                    </ul>
                  </Space>
                </Card>

                {/* Termination */}
                <Card id="termination" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <WarningOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      10. Chấm dứt dịch vụ
                    </Title>
                    <Paragraph>
                      Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản và quyền truy cập của bạn nếu:
                    </Paragraph>
                    <div className="terms-warning-box">
                      <ul className="terms-list">
                        <li>Bạn vi phạm bất kỳ điều khoản nào trong tài liệu này</li>
                        <li>Bạn sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                        <li>Bạn cung cấp thông tin giả mạo</li>
                        <li>Có yêu cầu từ cơ quan pháp luật</li>
                        <li>Để bảo vệ an ninh và quyền lợi của chúng tôi hoặc người dùng khác</li>
                      </ul>
                    </div>
                    <Paragraph>
                      Bạn có thể chấm dứt tài khoản của mình bất cứ lúc nào bằng cách liên hệ với chúng tôi.
                    </Paragraph>
                  </Space>
                </Card>

                {/* Changes */}
                <Card id="changes" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <InfoCircleOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      11. Thay đổi điều khoản
                    </Title>
                    <Paragraph>
                      Chúng tôi có quyền cập nhật, sửa đổi hoặc thay thế các điều khoản này bất cứ lúc nào. 
                      Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên trang web.
                    </Paragraph>
                    <Paragraph>
                      Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận 
                      các điều khoản mới.
                    </Paragraph>
                    <Alert
                      message="Khuyến nghị"
                      description="Chúng tôi khuyến khích bạn xem lại các điều khoản này định kỳ để cập nhật về các thay đổi."
                      type="info"
                      showIcon
                    />
                  </Space>
                </Card>

                {/* Contact */}
                <Card id="contact" className="terms-section-card">
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={2}>
                      <GlobalOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                      12. Liên hệ với chúng tôi
                    </Title>
                    <Paragraph>
                      Nếu bạn có câu hỏi, thắc mắc hoặc khiếu nại về các điều khoản này, vui lòng liên hệ với chúng tôi:
                    </Paragraph>

                    <div className="terms-contact-info">
                      <Card className="contact-card">
                        <Title level={4}>HOSPITAL CARE CENTER</Title>
                        <Space direction="vertical" size="small">
                          <Text>
                            <strong>Email:</strong> legal@hospitalcarecenter.com
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

                {/* Final Notice */}
                <Alert
                  message="Đồng ý với điều khoản"
                  description="Bằng cách sử dụng dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu trong tài liệu này."
                  type="success"
                  showIcon
                  style={{ marginTop: 32, borderRadius: 8 }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default TermsOfUse;

