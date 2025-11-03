import React, { useState } from "react";
import { Layout, Typography, Card, Collapse, Input, Space, Tag, Row, Col, Button, Empty } from "antd";
import {
  QuestionCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "./FAQ.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const FAQ = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeKey, setActiveKey] = useState([]);

  const faqData = [
    {
      key: "1",
      category: "Đặt lịch khám",
      icon: "📅",
      questions: [
        {
          q: "Làm thế nào để đặt lịch khám bệnh?",
          a: "Bạn có thể đặt lịch khám bệnh bằng cách:\n\n1. Truy cập trang web và chọn mục 'Đặt lịch khám'\n2. Chọn chuyên khoa và bác sĩ bạn muốn khám\n3. Chọn thời gian phù hợp với lịch của bạn\n4. Điền thông tin cá nhân và y tế cần thiết\n5. Xác nhận và thanh toán (nếu có)\n6. Nhận xác nhận qua email/SMS",
        },
        {
          q: "Tôi có thể đặt lịch cho người thân không?",
          a: "Có, bạn có thể đặt lịch cho người thân trong gia đình. Tuy nhiên, bạn cần:\n\n- Tạo tài khoản cho người thân hoặc sử dụng tài khoản của họ\n- Cung cấp thông tin y tế chính xác của người cần khám\n- Đảm bảo người thân đồng ý với việc khám bệnh",
        },
        {
          q: "Tôi có thể hủy hoặc đổi lịch hẹn không?",
          a: "Có, bạn có thể hủy hoặc đổi lịch hẹn:\n\n- Hủy/đổi trước 24 giờ: Không mất phí, hoàn tiền 100%\n- Hủy/đổi trước 12-24 giờ: Hoàn tiền 50%\n- Hủy sau 12 giờ hoặc không đến: Không hoàn tiền\n\nBạn có thể hủy/đổi lịch qua trang web, ứng dụng hoặc gọi hotline.",
        },
        {
          q: "Tôi cần đặt lịch khám khẩn cấp thì làm sao?",
          a: "Đối với trường hợp khẩn cấp:\n\n1. Gọi hotline 1900 123 456 (24/7) để được tư vấn ngay\n2. Đến thẳng bệnh viện vào phòng cấp cứu\n3. Sử dụng tính năng 'Khám khẩn cấp' trên trang web\n\nLưu ý: Trường hợp khẩn cấp về tính mạng, hãy gọi 115 ngay lập tức.",
        },
      ],
    },
    {
      key: "2",
      category: "Tư vấn trực tuyến",
      icon: "💻",
      questions: [
        {
          q: "Tư vấn trực tuyến có phí không?",
          a: "Có, tư vấn trực tuyến có phí. Giá sẽ khác nhau tùy theo:\n\n- Loại tư vấn (khám bệnh, tư vấn dinh dưỡng, tư vấn tâm lý...)\n- Bác sĩ/chuyên gia bạn chọn\n- Thời gian tư vấn\n\nGiá cả được hiển thị rõ ràng trước khi bạn đặt lịch. Bạn có thể thanh toán qua thẻ tín dụng, ví điện tử hoặc chuyển khoản.",
        },
        {
          q: "Tư vấn trực tuyến diễn ra như thế nào?",
          a: "Quy trình tư vấn trực tuyến:\n\n1. Đặt lịch và thanh toán\n2. Nhận link video call qua email/SMS\n3. Đăng nhập vào cuộc gọi đúng giờ hẹn\n4. Tư vấn với bác sĩ qua video call\n5. Nhận đơn thuốc và hướng dẫn sau tư vấn\n\nThời gian mỗi cuộc tư vấn thường từ 15-30 phút tùy theo nhu cầu.",
        },
        {
          q: "Tôi có thể nhận đơn thuốc sau tư vấn không?",
          a: "Có, sau mỗi cuộc tư vấn:\n\n- Bác sĩ sẽ kê đơn thuốc nếu cần thiết\n- Đơn thuốc sẽ được gửi đến email của bạn\n- Bạn có thể mua thuốc tại nhà thuốc của bệnh viện hoặc nhà thuốc bên ngoài\n- Đơn thuốc cũng được lưu trong hồ sơ y tế của bạn",
        },
        {
          q: "Tư vấn trực tuyến có được bảo hiểm y tế chi trả không?",
          a: "Hiện tại, tư vấn trực tuyến chưa được bảo hiểm y tế (BHYT) chi trả. Tuy nhiên:\n\n- Một số công ty bảo hiểm tư nhân có thể hỗ trợ\n- Bạn nên kiểm tra chính sách bảo hiểm của mình\n- Chúng tôi đang làm việc với các cơ quan để mở rộng dịch vụ được BHYT chi trả",
        },
      ],
    },
    {
      key: "3",
      category: "Thanh toán",
      icon: "💳",
      questions: [
        {
          q: "Các phương thức thanh toán nào được chấp nhận?",
          a: "Chúng tôi chấp nhận các phương thức thanh toán sau:\n\n- Thẻ tín dụng/ghi nợ: Visa, Mastercard, JCB\n- Ví điện tử: Momo, ZaloPay, VNPay\n- Chuyển khoản ngân hàng\n- Thanh toán tại quầy khi đến khám\n\nTất cả các giao dịch đều được mã hóa và bảo mật.",
        },
        {
          q: "Thanh toán có an toàn không?",
          a: "Rất an toàn. Chúng tôi sử dụng:\n\n- Cổng thanh toán được mã hóa SSL/TLS\n- Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn\n- Tuân thủ chuẩn bảo mật PCI DSS\n- Mọi giao dịch đều được giám sát và bảo vệ",
        },
        {
          q: "Tôi có nhận được hóa đơn sau thanh toán không?",
          a: "Có, sau mỗi giao dịch thanh toán thành công:\n\n- Bạn sẽ nhận được hóa đơn điện tử qua email\n- Hóa đơn cũng có thể xem trong tài khoản của bạn\n- Hóa đơn có thể in ra để làm thủ tục bảo hiểm hoặc thuế (nếu cần)\n- Hóa đơn có mã số hợp lệ pháp lý",
        },
        {
          q: "Tôi đã thanh toán nhưng không nhận được xác nhận thì sao?",
          a: "Trong trường hợp này, bạn nên:\n\n1. Kiểm tra lại email (cả hộp thư spam)\n2. Kiểm tra tài khoản trên trang web\n3. Gọi hotline 1900 123 456 để được hỗ trợ\n4. Cung cấp mã giao dịch để chúng tôi kiểm tra\n\nChúng tôi sẽ xử lý và hoàn tiền nếu có lỗi từ phía chúng tôi.",
        },
      ],
    },
    {
      key: "4",
      category: "Hồ sơ y tế",
      icon: "📋",
      questions: [
        {
          q: "Làm thế nào để xem hồ sơ y tế của tôi?",
          a: "Để xem hồ sơ y tế:\n\n1. Đăng nhập vào tài khoản của bạn\n2. Chọn mục 'Hồ sơ y tế' hoặc 'Lịch sử khám bệnh'\n3. Xem tất cả các lần khám, kết quả xét nghiệm, đơn thuốc\n4. Bạn có thể tải xuống hoặc in ra nếu cần\n\nLưu ý: Chỉ bạn mới có quyền xem hồ sơ y tế của mình.",
        },
        {
          q: "Tôi có thể chia sẻ hồ sơ y tế với bác sĩ khác không?",
          a: "Có, bạn có thể:\n\n- Xuất file PDF hồ sơ y tế từ tài khoản\n- Gửi cho bác sĩ khác qua email\n- Chia sẻ quyền truy cập tạm thời (nếu bác sĩ có tài khoản trên hệ thống)\n- In ra và mang đến phòng khám khác\n\nBạn hoàn toàn kiểm soát việc chia sẻ thông tin y tế của mình.",
        },
        {
          q: "Hồ sơ y tế của tôi có được bảo mật không?",
          a: "Rất bảo mật. Chúng tôi:\n\n- Mã hóa tất cả dữ liệu y tế\n- Chỉ bạn và bác sĩ điều trị mới có quyền truy cập\n- Tuân thủ nghiêm ngặt luật bảo vệ dữ liệu y tế\n- Có hệ thống giám sát an ninh 24/7\n- Không chia sẻ thông tin với bên thứ ba mà không có sự đồng ý của bạn",
        },
        {
          q: "Tôi có thể xóa hồ sơ y tế không?",
          a: "Theo quy định pháp luật về lưu trữ hồ sơ y tế:\n\n- Hồ sơ y tế phải được lưu trữ tối thiểu 10 năm\n- Bạn không thể tự xóa hồ sơ y tế\n- Bạn có thể yêu cầu ẩn một số thông tin nhất định\n- Bạn có thể khiếu nại nếu có thông tin sai lệch\n\nNếu có nhu cầu cụ thể, vui lòng liên hệ bộ phận hỗ trợ.",
        },
      ],
    },
    {
      key: "5",
      category: "Tài khoản",
      icon: "👤",
      questions: [
        {
          q: "Làm thế nào để tạo tài khoản?",
          a: "Để tạo tài khoản:\n\n1. Nhấp vào nút 'Đăng ký' ở góc trên bên phải\n2. Điền thông tin cá nhân: Họ tên, email, số điện thoại\n3. Tạo mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số)\n4. Xác nhận email qua link gửi đến hộp thư của bạn\n5. Hoàn thiện thông tin hồ sơ\n\nSau khi đăng ký, bạn có thể sử dụng tất cả các dịch vụ.",
        },
        {
          q: "Tôi quên mật khẩu thì làm sao?",
          a: "Để khôi phục mật khẩu:\n\n1. Nhấp vào 'Quên mật khẩu' ở trang đăng nhập\n2. Nhập email hoặc số điện thoại đã đăng ký\n3. Nhận link đặt lại mật khẩu qua email/SMS\n4. Tạo mật khẩu mới\n5. Đăng nhập lại bằng mật khẩu mới\n\nNếu không nhận được email, kiểm tra hộp thư spam hoặc liên hệ hỗ trợ.",
        },
        {
          q: "Tôi có thể thay đổi thông tin tài khoản không?",
          a: "Có, bạn có thể thay đổi:\n\n- Thông tin cá nhân (họ tên, ngày sinh...)\n- Email và số điện thoại\n- Mật khẩu\n- Địa chỉ\n- Thông tin liên hệ khẩn cấp\n\nTuy nhiên, một số thông tin như CMND/CCCD cần liên hệ bộ phận hỗ trợ để thay đổi. Truy cập mục 'Thông tin cá nhân' để cập nhật.",
        },
        {
          q: "Tôi có thể xóa tài khoản không?",
          a: "Bạn có thể yêu cầu xóa tài khoản, tuy nhiên:\n\n- Hồ sơ y tế sẽ được lưu trữ theo quy định pháp luật\n- Bạn không thể khôi phục tài khoản sau khi xóa\n- Các dịch vụ đang sử dụng sẽ bị chấm dứt\n- Thanh toán chưa hoàn thành sẽ được hoàn tiền\n\nĐể xóa tài khoản, vui lòng liên hệ bộ phận hỗ trợ qua email hoặc hotline.",
        },
      ],
    },
    {
      key: "6",
      category: "Bảo hiểm y tế",
      icon: "🏥",
      questions: [
        {
          q: "Tôi có thể sử dụng bảo hiểm y tế (BHYT) không?",
          a: "Có, bạn có thể sử dụng BHYT khi:\n\n- Khám trực tiếp tại bệnh viện\n- Có thẻ BHYT còn hiệu lực\n- Dịch vụ nằm trong danh mục được BHYT chi trả\n- Đúng tuyến hoặc đúng thủ tục chuyển tuyến\n\nTư vấn trực tuyến hiện chưa được BHYT chi trả. Bạn sẽ được thông báo phần nào BHYT chi trả và phần nào tự chi trả.",
        },
        {
          q: "Làm thế nào để đăng ký sử dụng BHYT?",
          a: "Để sử dụng BHYT:\n\n1. Khi đặt lịch, chọn 'Sử dụng BHYT'\n2. Nhập số thẻ BHYT\n3. Kiểm tra thông tin BHYT của bạn\n4. Mang thẻ BHYT khi đến khám\n5. Trả phần còn lại (nếu có) sau khi BHYT đã chi trả\n\nHệ thống sẽ tự động tính toán phần BHYT chi trả và phần bạn phải thanh toán.",
        },
        {
          q: "Tôi có thể sử dụng BHYT khác tuyến không?",
          a: "Có, bạn có thể sử dụng BHYT khác tuyến, nhưng:\n\n- Mức chi trả sẽ thấp hơn so với đúng tuyến (thường 70-80%)\n- Bạn cần thanh toán phần còn lại\n- Một số dịch vụ đặc biệt có thể không được chi trả\n- Vui lòng mang đầy đủ giấy tờ BHYT khi đến khám",
        },
        {
          q: "BHYT chi trả những dịch vụ nào?",
          a: "BHYT thường chi trả:\n\n- Khám bệnh định kỳ\n- Xét nghiệm cơ bản\n- Một số loại thuốc trong danh mục\n- Chụp X-quang, siêu âm (một phần)\n- Phẫu thuật (trong một số trường hợp)\n\nTuy nhiên, mức chi trả và danh mục có thể thay đổi. Bạn sẽ được tư vấn cụ thể khi đặt lịch hoặc đến khám.",
        },
      ],
    },
    {
      key: "7",
      category: "Dịch vụ khác",
      icon: "⭐",
      questions: [
        {
          q: "Bệnh viện có dịch vụ khám tại nhà không?",
          a: "Hiện tại chúng tôi chưa cung cấp dịch vụ khám tại nhà. Tuy nhiên:\n\n- Chúng tôi có dịch vụ tư vấn trực tuyến qua video call\n- Bạn có thể đặt lịch khám tại bệnh viện\n- Trong trường hợp đặc biệt, vui lòng liên hệ bộ phận hỗ trợ\n\nChúng tôi đang nghiên cứu để triển khai dịch vụ khám tại nhà trong tương lai.",
        },
        {
          q: "Bệnh viện có phục vụ ngoài giờ không?",
          a: "Có, chúng tôi có:\n\n- Phòng cấp cứu hoạt động 24/7\n- Một số chuyên khoa có lịch khám buổi tối và cuối tuần\n- Tư vấn trực tuyến có thể đặt lịch cả ngoài giờ\n- Hotline hỗ trợ 24/7\n\nVui lòng kiểm tra lịch khám cụ thể của từng chuyên khoa trên trang web.",
        },
        {
          q: "Tôi có thể liên lạc với bác sĩ sau khi khám không?",
          a: "Có, bạn có thể:\n\n- Sử dụng hệ thống nhắn tin trong tài khoản để liên lạc với bác sĩ\n- Đặt lịch tư vấn trực tuyến tiếp theo\n- Gọi hotline để được chuyển đến bác sĩ điều trị\n- Gửi email qua hệ thống (bác sĩ sẽ trả lời trong vòng 24-48 giờ)\n\nLưu ý: Không sử dụng cho trường hợp khẩn cấp. Trường hợp khẩn cấp, hãy đến phòng cấp cứu hoặc gọi 115.",
        },
        {
          q: "Tôi muốn góp ý hoặc khiếu nại thì làm sao?",
          a: "Chúng tôi luôn lắng nghe phản hồi của bạn:\n\n1. Gửi email đến: feedback@hospitalcarecenter.com\n2. Gọi hotline 1900 123 456\n3. Điền form phản hồi trong tài khoản\n4. Liên hệ bộ phận tiếp nhận khiếu nại tại bệnh viện\n\nChúng tôi cam kết phản hồi và xử lý mọi ý kiến trong vòng 3-5 ngày làm việc.",
        },
      ],
    },
  ];

  const handleSearch = (value) => {
    setSearchValue(value);
    if (value) {
      const matchingKeys = faqData
        .flatMap((category) =>
          category.questions
            .map((q, index) =>
              q.q.toLowerCase().includes(value.toLowerCase()) ||
              q.a.toLowerCase().includes(value.toLowerCase())
                ? `${category.key}-${index}`
                : null
            )
            .filter(Boolean)
        )
        .map((key) => key);
      setActiveKey(matchingKeys);
    } else {
      setActiveKey([]);
    }
  };

  const filteredData = searchValue
    ? faqData.map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(searchValue.toLowerCase()) ||
            q.a.toLowerCase().includes(searchValue.toLowerCase())
        ),
      }))
    : faqData;

  return (
    <Layout className="faq-layout">
      <Content className="faq-content">
        {/* Hero Section */}
        <div className="faq-hero-section">
          <div className="faq-hero-content">
            <Space direction="vertical" size="large" align="center">
              <div className="faq-hero-icon">
                <QuestionCircleOutlined style={{ fontSize: 80, color: "#1890ff" }} />
              </div>
              <Title level={1} className="faq-hero-title">
                Câu Hỏi Thường Gặp
              </Title>
              <Text className="faq-hero-subtitle">
                Tìm câu trả lời cho những thắc mắc phổ biến của bạn
              </Text>
            </Space>
          </div>
        </div>

        {/* Search Section */}
        <div className="faq-search-section">
          <div className="faq-search-container">
            <Search
              placeholder="Tìm kiếm câu hỏi..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 600, margin: "0 auto" }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="faq-main-container">
          {filteredData.some((category) => category.questions.length > 0) ? (
            <Row gutter={[24, 24]}>
              {filteredData.map(
                (category) =>
                  category.questions.length > 0 && (
                    <Col xs={24} lg={12} key={category.key}>
                      <Card className="faq-category-card">
                        <div className="faq-category-header">
                          <Space>
                            <span className="faq-category-icon">{category.icon}</span>
                            <Title level={4} className="faq-category-title">
                              {category.category}
                            </Title>
                          </Space>
                        </div>
                        <Collapse
                          items={category.questions.map((item, index) => ({
                            key: `${category.key}-${index}`,
                            label: <Text strong>{item.q}</Text>,
                            children: <Paragraph style={{ whiteSpace: "pre-line" }}>{item.a}</Paragraph>,
                            className: "faq-panel"
                          }))}
                          activeKey={activeKey}
                          onChange={setActiveKey}
                          expandIcon={({ isActive }) =>
                            isActive ? (
                              <MinusOutlined style={{ color: "#1890ff" }} />
                            ) : (
                              <PlusOutlined style={{ color: "#1890ff" }} />
                            )
                          }
                          className="faq-collapse"
                        />
                      </Card>
                    </Col>
                  )
              )}
            </Row>
          ) : (
            <Empty
              description="Không tìm thấy câu hỏi phù hợp"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* Contact Support */}
          <Card className="faq-support-card">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={16}>
                <Space direction="vertical" size="middle">
                  <Title level={3}>
                    <CustomerServiceOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                    Vẫn chưa tìm thấy câu trả lời?
                  </Title>
                  <Paragraph>
                    Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn. Liên hệ với chúng tôi 
                    qua các kênh sau:
                  </Paragraph>
                  <Space direction="vertical" size="small">
                    <Space>
                      <PhoneOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                      <Text strong>Hotline:</Text>
                      <Text>1900 123 456 (24/7)</Text>
                    </Space>
                    <Space>
                      <MailOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                      <Text strong>Email:</Text>
                      <Text>support@hospitalcarecenter.com</Text>
                    </Space>
                    <Space>
                      <MessageOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                      <Text strong>Chat trực tuyến:</Text>
                      <Text>Có sẵn trên trang web (8:00 - 22:00)</Text>
                    </Space>
                  </Space>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PhoneOutlined />}
                    onClick={() => window.open("tel:1900123456")}
                  >
                    Gọi ngay
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<MailOutlined />}
                    onClick={() => window.open("mailto:support@hospitalcarecenter.com")}
                  >
                    Gửi email
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default FAQ;

