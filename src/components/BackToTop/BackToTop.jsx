import { useState, useEffect } from "react";
import { FloatButton } from "antd";
import { VerticalAlignTopOutlined } from "@ant-design/icons";
import "./BackToTop.css";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button when page is scrolled down
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <FloatButton
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      type="primary"
      style={{
        right: 24,
        bottom: 24,
        width: 50,
        height: 50,
      }}
      className="back-to-top-button"
    />
  );
};

export default BackToTop;

