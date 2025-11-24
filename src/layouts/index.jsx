import React from "react";
import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import MedicalChatBox from "../components/MedicalChatBox/MedicalChatBox";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import BackToTop from "../components/BackToTop/BackToTop";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <ScrollToTop />
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer/>
      <MedicalChatBox />
      <BackToTop />
    </div>
  );
};

export default Layout;
