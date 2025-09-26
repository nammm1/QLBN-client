import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./News.css";

const News = () => {
  const categories = ["Mới nhất","Giải thưởng", "Hoạt động nghiên cứu", "Loại tin tức A", "Loại tin tức B"];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const posts = [
    { id: 1, title: "Đây là tiêu đề bài viết 1", summary: "Đây là nội dung tóm tắt bài viết 1" },
    { id: 2, title: "Đây là tiêu đề bài viết 2", summary: "Đây là nội dung tóm tắt bài viết 2" },
    { id: 3, title: "Đây là tiêu đề bài viết 3", summary: "Đây là nội dung tóm tắt bài viết 3" },
    { id: 4, title: "Đây là tiêu đề bài viết 4", summary: "Đây là nội dung tóm tắt bài viết 4" },
    { id: 5, title: "Đây là tiêu đề bài viết 5", summary: "Đây là nội dung tóm tắt bài viết 5" },
    { id: 6, title: "Đây là tiêu đề bài viết 6", summary: "Đây là nội dung tóm tắt bài viết 6" },
    { id: 7, title: "Đây là tiêu đề bài viết 7", summary: "Đây là nội dung tóm tắt bài viết 7" },
    { id: 8, title: "Đây là tiêu đề bài viết 8", summary: "Đây là nội dung tóm tắt bài viết 8" },
  ];

  return (
    <div className="container news-container">
      {/* Tiêu đề */}
      <h2>Bài viết mới nhất</h2>

      {/* Danh mục */}
      <div className="news-category">
        {categories.map((cat, index) => (
          <span
            key={index}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Danh sách bài viết (4 bài 1 hàng) */}
      <div className="row g-4">
        {posts.map((post) => (
          <div key={post.id} className="col-lg-3 col-md-4 col-sm-6">
            <div className="card h-100 shadow-sm news-card">
              <div className="card-img-top"></div>
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.summary}</p>
                <a href="#">Xem thêm →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
