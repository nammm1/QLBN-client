import React from "react";
import Header from "../components/Header/Header";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import MedicalChatBox from "../components/MedicalChatBox/MedicalChatBox";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer/>
      <MedicalChatBox />
    </div>
  );
};

export default Layout;
