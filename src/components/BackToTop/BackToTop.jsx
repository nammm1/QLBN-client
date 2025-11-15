import { useState, useEffect } from "react";
import { FloatButton } from "antd";
import "./BackToTop.css";

const BackToTopIcon = () => (
  <svg
    className="back-to-top-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="backToTopGradient"
        x1="4"
        y1="20"
        x2="20"
        y2="4"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#4facfe" />
        <stop offset="1" stopColor="#00f2fe" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#backToTopGradient)"
      strokeWidth="1.5"
      fill="rgba(255,255,255,0.08)"
    />
    <path
      d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5"
      stroke="url(#backToTopGradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      icon={<BackToTopIcon />}
      onClick={scrollToTop}
      type="default"
      style={{
        right: 24,
        bottom: 24,
        width: 50,
        height: 50,
        background: "linear-gradient(135deg, rgba(33, 150, 243, 0.26), rgba(0, 242, 254, 0.18))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
      }}
      className="back-to-top-button"
    />
  );
};

export default BackToTop;

