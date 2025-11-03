import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tabs,
  Typography,
  Tag,
  Button,
  Space,
  Avatar,
  Divider,
  Input,
  Pagination,
  Modal,
  Image,
  Badge,
  FloatButton
} from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  FireOutlined,
  TrophyOutlined,
  ExperimentOutlined,
  HeartOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  LikeOutlined,
  CommentOutlined,
  UpCircleOutlined
} from "@ant-design/icons";
import "./News.css";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Meta } = Card;

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("Mới nhất");
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const pageSize = 8;

  const categories = [
    { key: "Mới nhất", label: "Mới nhất", icon: <FireOutlined />, color: "#ff4d4f" },
    { key: "Giải thưởng", label: "Giải thưởng", icon: <TrophyOutlined />, color: "#faad14" },
    { key: "Nghiên cứu", label: "Hoạt động nghiên cứu", icon: <ExperimentOutlined />, color: "#52c41a" },
    { key: "Sức khỏe", label: "Sức khỏe cộng đồng", icon: <HeartOutlined />, color: "#eb2f96" },
    { key: "Công nghệ", label: "Công nghệ y tế", icon: <GlobalOutlined />, color: "#1890ff" },
  ];

  const allPosts = [
    {
      id: 1,
      title: "Bệnh viện đạt chứng nhận chất lượng quốc tế JCI lần thứ 3",
      summary: "Với sự nỗ lực không ngừng trong việc nâng cao chất lượng dịch vụ, bệnh viện chúng tôi vừa đạt được chứng nhận JCI lần thứ 3, khẳng định vị thế hàng đầu trong khu vực.",
      category: "Giải thưởng",
      date: "2024-01-15",
      views: 1250,
      likes: 89,
      comments: 23,
      author: "Phòng Truyền thông",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Chứng nhận JCI (Joint Commission International) là tiêu chuẩn vàng trong lĩnh vực y tế quốc tế. Lần này, bệnh viện chúng tôi đã vượt qua các tiêu chuẩn khắt khe về chất lượng dịch vụ, an toàn bệnh nhân, và quản lý hệ thống. Đây là thành quả của quá trình nỗ lực liên tục trong nhiều năm qua. Chúng tôi cam kết sẽ tiếp tục duy trì và nâng cao chất lượng để mang đến dịch vụ tốt nhất cho bệnh nhân.",
      tags: ["Chứng nhận", "Chất lượng", "JCI"],
      featured: true
    },
    {
      id: 2,
      title: "Nghiên cứu mới về điều trị ung thư bằng công nghệ AI",
      summary: "Đội ngũ nghiên cứu của bệnh viện đã công bố kết quả nghiên cứu ứng dụng trí tuệ nhân tạo trong chẩn đoán và điều trị ung thư, mở ra hướng đi mới trong y học.",
      category: "Nghiên cứu",
      date: "2024-01-10",
      views: 2100,
      likes: 156,
      comments: 42,
      author: "TS. Nguyễn Văn A",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Công nghệ AI đang cách mạng hóa ngành y tế, và nghiên cứu của chúng tôi tập trung vào việc ứng dụng machine learning trong chẩn đoán ung thư. Kết quả ban đầu cho thấy độ chính xác cao hơn 20% so với phương pháp truyền thống. Nghiên cứu này được thực hiện trên hơn 10,000 bệnh nhân và đã được công bố trên tạp chí y khoa quốc tế hàng đầu.",
      tags: ["Nghiên cứu", "AI", "Ung thư"],
      featured: true
    },
    {
      id: 3,
      title: "Triển khai chương trình tầm soát ung thư miễn phí cho cộng đồng",
      summary: "Bệnh viện phát động chương trình tầm soát ung thư miễn phí cho 1000 người dân có hoàn cảnh khó khăn, góp phần nâng cao nhận thức về phòng chống ung thư.",
      category: "Sức khỏe",
      date: "2024-01-08",
      views: 3500,
      likes: 234,
      comments: 67,
      author: "BS. Trần Thị B",
      image: "data:image/jpeg;base64,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",
      fullContent: "Chương trình này được thực hiện nhằm mục đích phát hiện sớm ung thư, giúp tăng tỷ lệ điều trị thành công. Ngoài việc tầm soát miễn phí, bệnh viện còn tổ chức các buổi tư vấn về cách phòng tránh và phát hiện sớm các dấu hiệu ung thư. Chương trình nhận được sự ủng hộ nhiệt tình từ cộng đồng và các tổ chức xã hội.",
      tags: ["Cộng đồng", "Tầm soát", "Ung thư"],
      featured: false
    },
    {
      id: 4,
      title: "Ứng dụng công nghệ Telemedicine - Khám bệnh từ xa",
      summary: "Bệnh viện triển khai hệ thống khám bệnh từ xa, cho phép bệnh nhân được tư vấn và khám bệnh trực tuyến với bác sĩ mà không cần đến bệnh viện.",
      category: "Công nghệ",
      date: "2024-01-05",
      views: 2800,
      likes: 178,
      comments: 51,
      author: "ThS. Lê Văn C",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Với sự phát triển của công nghệ, telemedicine đang trở thành xu hướng tất yếu. Hệ thống của chúng tôi cho phép bệnh nhân đặt lịch khám online, trao đổi trực tiếp với bác sĩ qua video call, nhận đơn thuốc điện tử. Điều này giúp tiết kiệm thời gian, chi phí đi lại, đặc biệt hữu ích cho bệnh nhân ở xa hoặc có khó khăn trong việc di chuyển.",
      tags: ["Công nghệ", "Telemedicine", "Khám online"],
      featured: false
    },
    {
      id: 5,
      title: "Bệnh viện đạt giải thưởng 'Bệnh viện xuất sắc năm 2024'",
      summary: "Với những đóng góp xuất sắc trong lĩnh vực y tế, bệnh viện vinh dự nhận giải thưởng 'Bệnh viện xuất sắc năm 2024' từ Bộ Y tế.",
      category: "Giải thưởng",
      date: "2024-01-03",
      views: 1650,
      likes: 112,
      comments: 34,
      author: "Phòng Truyền thông",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Giải thưởng này là sự ghi nhận cho những nỗ lực không ngừng của toàn thể đội ngũ y bác sĩ và nhân viên bệnh viện. Trong năm qua, bệnh viện đã đạt được nhiều thành tựu nổi bật: điều trị thành công cho hơn 50,000 bệnh nhân, tỷ lệ hài lòng đạt 98%, và nhiều nghiên cứu được công bố trên tạp chí quốc tế.",
      tags: ["Giải thưởng", "Thành tựu", "2024"],
      featured: false
    },
    {
      id: 6,
      title: "Nghiên cứu về chế độ dinh dưỡng phòng ngừa bệnh tim mạch",
      summary: "Đội ngũ chuyên gia dinh dưỡng công bố nghiên cứu mới về mối liên hệ giữa chế độ ăn uống và bệnh tim mạch, cung cấp hướng dẫn cụ thể về dinh dưỡng khoa học.",
      category: "Nghiên cứu",
      date: "2023-12-28",
      views: 3200,
      likes: 198,
      comments: 45,
      author: "PGS.TS Nguyễn Thị D",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Nghiên cứu được thực hiện trên 5,000 người tham gia trong vòng 3 năm. Kết quả cho thấy việc tuân thủ chế độ dinh dưỡng Địa Trung Hải giúp giảm 30% nguy cơ mắc bệnh tim mạch. Nghiên cứu cũng chỉ ra tầm quan trọng của việc hạn chế muối, đường và chất béo bão hòa trong khẩu phần ăn hàng ngày.",
      tags: ["Dinh dưỡng", "Tim mạch", "Nghiên cứu"],
      featured: false
    },
    {
      id: 7,
      title: "Khóa đào tạo kỹ năng cấp cứu cho nhân viên y tế cộng đồng",
      summary: "Bệnh viện tổ chức khóa đào tạo kỹ năng cấp cứu cơ bản cho 200 nhân viên y tế tại các trạm y tế phường xã, nâng cao năng lực chăm sóc sức khỏe tại cộng đồng.",
      category: "Sức khỏe",
      date: "2023-12-25",
      views: 1950,
      likes: 87,
      comments: 28,
      author: "BS. Phạm Văn E",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRJOfzNETzwEMRDdc-DpSCA6o5fEZ8yV2xuw&s",
      fullContent: "Khóa đào tạo tập trung vào các kỹ năng cấp cứu cơ bản như hồi sức tim phổi (CPR), xử lý sốc, cầm máu, và sơ cứu các tai nạn thường gặp. Chương trình kéo dài 2 ngày với phần lý thuyết và thực hành. Đây là một phần trong chiến lược nâng cao chất lượng chăm sóc sức khỏe tại cộng đồng của bệnh viện.",
      tags: ["Đào tạo", "Cấp cứu", "Cộng đồng"],
      featured: false
    },
    {
      id: 8,
      title: "Triển khai hệ thống quản lý bệnh viện thông minh (HIS)",
      summary: "Bệnh viện đưa vào sử dụng hệ thống quản lý bệnh viện thông minh, giúp tối ưu hóa quy trình khám chữa bệnh và cải thiện trải nghiệm bệnh nhân.",
      category: "Công nghệ",
      date: "2023-12-20",
      views: 2400,
      likes: 134,
      comments: 39,
      author: "ThS. Hoàng Thị F",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Hệ thống HIS (Hospital Information System) mới được tích hợp AI giúp tự động hóa nhiều quy trình, từ đặt lịch khám đến quản lý hồ sơ bệnh án điện tử. Hệ thống cũng tích hợp với các thiết bị y tế để tự động cập nhật kết quả xét nghiệm, chẩn đoán hình ảnh. Điều này giúp giảm thời gian chờ đợi và tăng độ chính xác trong chẩn đoán.",
      tags: ["Công nghệ", "HIS", "Tự động hóa"],
      featured: false
    },
    {
      id: 9,
      title: "Chương trình 'Ngày hội sức khỏe' - Khám sức khỏe miễn phí",
      summary: "Bệnh viện tổ chức 'Ngày hội sức khỏe' với các hoạt động khám sức khỏe miễn phí, tư vấn dinh dưỡng và chia sẻ kiến thức y tế cho cộng đồng.",
      category: "Sức khỏe",
      date: "2023-12-18",
      views: 4200,
      likes: 267,
      comments: 73,
      author: "Phòng Truyền thông",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: "Sự kiện thu hút hơn 2,000 người tham gia với nhiều hoạt động phong phú: khám sức khỏe tổng quát, đo huyết áp, đường huyết, tư vấn dinh dưỡng, và các bài giảng về phòng bệnh. Chương trình nhận được sự ủng hộ nhiệt tình từ người dân và các tổ chức xã hội. Bệnh viện cam kết sẽ tiếp tục tổ chức các hoạt động tương tự trong tương lai.",
      tags: ["Sự kiện", "Cộng đồng", "Sức khỏe"],
      featured: true
    },
    {
      id: 10,
      title: "Nghiên cứu mới về liệu pháp gen trong điều trị ung thư",
      summary: "Đội ngũ nghiên cứu công bố kết quả nghiên cứu về ứng dụng liệu pháp gen trong điều trị ung thư, mở ra hy vọng mới cho bệnh nhân ung thư giai đoạn muộn.",
      category: "Nghiên cứu",
      date: "2023-12-15",
      views: 3100,
      likes: 189,
      comments: 52,
      author: "GS.TS Trần Văn G",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHYgmSzrj4AihyAYi_h5kdQyBlXROLal-d2A&s",
      fullContent: "Liệu pháp gen là một trong những hướng đi mới nhất trong điều trị ung thư. Nghiên cứu của chúng tôi tập trung vào việc sửa đổi gen để tăng cường khả năng miễn dịch của cơ thể chống lại tế bào ung thư. Kết quả thử nghiệm lâm sàng cho thấy tỷ lệ đáp ứng điều trị đạt 60%, cao hơn nhiều so với các phương pháp truyền thống.",
      tags: ["Liệu pháp gen", "Ung thư", "Nghiên cứu"],
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === "Mới nhất" 
    ? allPosts 
    : allPosts.filter((post) => post.category === selectedCategory);

  const searchedPosts = searchValue 
    ? filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchValue.toLowerCase()) || 
        post.summary.toLowerCase().includes(searchValue.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
      )
    : filteredPosts;

  const paginatedPosts = searchedPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categoryItems = categories.map((cat) => ({
    key: cat.key,
    label: (
      <Space>
        {cat.icon}
        <span>{cat.label}</span>
      </Space>
    ),
  }));

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.key === category);
    return cat ? cat.color : "#1890ff";
  };

  const featuredPosts = allPosts.filter(post => post.featured);

  return (
    <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: 60, position: "relative" }}>
          <div style={{
            position: "absolute",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 100,
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            borderRadius: "50%",
            opacity: 0.1
          }}></div>
          <Title level={1} style={{ 
            color: "#096dd9", 
            marginBottom: 16, 
            fontSize: "3.5rem",
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Tin tức & Sự kiện
          </Title>
          <Paragraph style={{ 
            fontSize: 18, 
            color: "#666", 
            maxWidth: 700, 
            margin: "0 auto 32px",
            lineHeight: 1.6
          }}>
            Cập nhật những tin tức mới nhất về hoạt động y tế, nghiên cứu khoa học, giải thưởng và sự kiện của bệnh viện
          </Paragraph>
          <Search
            placeholder="Tìm kiếm bài viết, từ khóa..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 500, margin: "0 auto" }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ marginBottom: 40 }}>
          <Tabs
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
            items={categoryItems}
            size="large"
            tabBarStyle={{
              borderBottom: "2px solid #e6f7ff",
            }}
            tabBarGutter={32}
          />
        </div>

        {/* Posts Grid */}
        <Row gutter={[24, 24]}>
          {paginatedPosts.map((post) => (
            <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
              <Card
                hoverable
                className="news-card"
                style={{
                  height: "100%",
                  borderRadius: 20,
                  border: "none",
                  background: "white",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                  position: "relative"
                }}
                cover={
                  <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                    <img
                      alt={post.title}
                      src={post.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      className="news-image"
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                      }}
                    >
                      <Tag 
                        color={getCategoryColor(post.category)} 
                        style={{ 
                          fontSize: 12, 
                          fontWeight: 600,
                          border: "none",
                          borderRadius: 12,
                          padding: "4px 12px"
                        }}
                      >
                        {post.category}
                      </Tag>
                    </div>
                    {post.featured && (
                      <div style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                      }}>
                        <Badge.Ribbon text="Nổi bật" color="red">
                          <div></div>
                        </Badge.Ribbon>
                      </div>
                    )}
                  </div>
                }
                styles={{ body: { padding: 24 } }}
                onClick={() => handlePostClick(post)}
              >
                <Title
                  level={5}
                  style={{
                    color: "#096dd9",
                    marginBottom: 12,
                    fontSize: 16,
                    minHeight: 48,
                    lineHeight: 1.4,
                    fontWeight: 600
                  }}
                  ellipsis={{ rows: 2 }}
                >
                  {post.title}
                </Title>
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ 
                    color: "#666", 
                    marginBottom: 16, 
                    fontSize: 14, 
                    lineHeight: 1.6, 
                    minHeight: 63 
                  }}
                >
                  {post.summary}
                </Paragraph>
                
                <Divider style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />
                
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Space>
                    <CalendarOutlined style={{ color: "#8c8c8c", fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(post.date)}
                    </Text>
                  </Space>
                  <Space>
                    <EyeOutlined style={{ color: "#8c8c8c", fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {post.views.toLocaleString()} lượt xem
                    </Text>
                  </Space>
                  <Space>
                    <LikeOutlined style={{ color: "#8c8c8c", fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {post.likes} lượt thích
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* No Results */}
        {paginatedPosts.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }} />
            <Title level={4} style={{ color: "#bfbfbf" }}>
              Không tìm thấy bài viết phù hợp
            </Title>
            <Text type="secondary">
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </Text>
          </div>
        )}

        {/* Pagination */}
        {searchedPosts.length > pageSize && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Pagination
              current={currentPage}
              total={searchedPosts.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total) => `Tổng ${total} bài viết`}
              itemRender={(page, type, originalElement) => {
                if (type === 'page') {
                  return <span style={{ display: 'block', visibility: 'visible', opacity: 1 }}>{page}</span>;
                }
                return originalElement;
              }}
              style={{ 
                display: "inline-block",
                background: "white",
                padding: "16px 24px",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
          </div>
        )}

        {/* Featured Posts */}
        {selectedCategory === "Mới nhất" && featuredPosts.length > 0 && (
          <>
            <Divider style={{ margin: "60px 0" }} />
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <Title level={2} style={{ 
                color: "#096dd9", 
                marginBottom: 16, 
                fontSize: "2.5rem",
                position: "relative",
                display: "inline-block"
              }}>
                Bài viết nổi bật
                <div style={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 4,
                  background: "linear-gradient(90deg, #1890ff, #52c41a)",
                  borderRadius: 2
                }}></div>
              </Title>
            </div>
            <Row gutter={[24, 24]}>
              {featuredPosts.map((post) => (
                <Col xs={24} md={8} key={post.id}>
                  <Card
                    hoverable
                    style={{
                      height: "100%",
                      borderRadius: 20,
                      border: "none",
                      background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                      boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      position: "relative"
                    }}
                    cover={
                      <div style={{ height: 250, overflow: "hidden", position: "relative" }}>
                        <img
                          alt={post.title}
                          src={post.image}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover",
                            transition: "transform 0.3s ease"
                          }}
                          className="news-image"
                        />
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 50%)"
                        }}></div>
                      </div>
                    }
                    styles={{ body: { padding: 24 } }}
                    onClick={() => handlePostClick(post)}
                  >
                    <Tag color="red" style={{ 
                      marginBottom: 16, 
                      border: "none",
                      borderRadius: 12,
                      padding: "4px 12px",
                      fontWeight: 600
                    }}>
                      <FireOutlined /> Nổi bật
                    </Tag>
                    <Title level={4} style={{ 
                      color: "#096dd9", 
                      marginBottom: 12, 
                      fontSize: 18,
                      lineHeight: 1.4
                    }}>
                      {post.title}
                    </Title>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ 
                      color: "#666", 
                      marginBottom: 20, 
                      fontSize: 14,
                      lineHeight: 1.6
                    }}>
                      {post.summary}
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      style={{ 
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 600
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post);
                      }}
                    >
                      Đọc thêm
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>

      {/* Post Detail Modal */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        closeIcon={<div style={{
          background: "white",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}>✕</div>}
      >
        {selectedPost && (
          <div style={{ borderRadius: 20, overflow: "hidden" }}>
            <Image 
              src={selectedPost.image} 
              alt={selectedPost.title} 
              style={{ 
                width: "100%", 
                height: 400, 
                objectFit: "cover",
                display: "block"
              }} 
              preview={false}
            />
            <div style={{ padding: 32 }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <Space>
                    <Tag color={getCategoryColor(selectedPost.category)} style={{ 
                      border: "none",
                      borderRadius: 12,
                      padding: "4px 12px",
                      fontWeight: 600
                    }}>
                      {selectedPost.category}
                    </Tag>
                    <Text type="secondary">
                      <CalendarOutlined /> {formatDate(selectedPost.date)}
                    </Text>
                    <Text type="secondary">
                      <EyeOutlined /> {selectedPost.views.toLocaleString()} lượt xem
                    </Text>
                  </Space>
              </div>
                
                <Title level={2} style={{ 
                  color: "#096dd9", 
                  marginBottom: 16,
                  lineHeight: 1.3
                }}>
                  {selectedPost.title}
                </Title>
                
                <Paragraph style={{ 
                  fontSize: 16, 
                  lineHeight: 1.8, 
                  color: "#666", 
                  marginBottom: 24 
                }}>
                  {selectedPost.fullContent}
                </Paragraph>
                
                <Divider />
                
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <Avatar 
                      size="large" 
                      icon={<UserOutlined />} 
                      style={{ 
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)" 
                      }} 
                    />
                    <div>
                      <Text strong style={{ display: "block" }}>
                        {selectedPost.author}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tác giả
                      </Text>
            </div>
                  </Space>
                  
                  <Space>
                    <Button icon={<LikeOutlined />}>
                      {selectedPost.likes}
                    </Button>
                    <Button icon={<CommentOutlined />}>
                      {selectedPost.comments}
                    </Button>
                    <Button icon={<ShareAltOutlined />}>
                      Chia sẻ
                    </Button>
                  </Space>
                </Space>
                
                <Space wrap style={{ marginTop: 16 }}>
                  {selectedPost.tags.map((tag, idx) => (
                    <Tag key={idx} color="blue" style={{ borderRadius: 12, padding: "4px 12px" }}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Space>
      </div>
          </div>
        )}
      </Modal>

      {/* Floating Action Button */}
      <FloatButton.BackTop 
        icon={<UpCircleOutlined />}
        style={{ 
          right: 24,
          bottom: 24,
        }}
      />
    </div>
  );
};

export default News;
