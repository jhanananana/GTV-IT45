import React, { useState } from "react";
import "./navbarAndFooter.css";

export const Navbar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img
              onClick={toggleSidebar}
              className="hamburger"
              src="/images/hamburger.png"
              alt="hamburger"
            />
            <a href="/home">
              <img className="logo" src="/images/logo.png" alt="Logo" />
            </a>
            <a href="/home" className="shop-name">
              Galanter & Jones
            </a>
          </div>
        </div>
      </header>
      {isSidebarVisible && <Sidebar />}
    </>
  );
};

export default Navbar;

export const Sidebar = () => {
  return (
    <div className="sidebar-container" id="sidebar">
      <a href="/home">
        <div className="sidebar-item">Home</div>
      </a>
      <a href="/liquidationreport">
        <div className="sidebar-item">Liquidation Form</div>
      </a>
      <a href="/cashadvance">
        <div className="sidebar-item">Cash Advance Request</div>
      </a>
      <a href="/dashboard1">
        <div className="sidebar-item">Dashboard 1 (For Input & Approval)</div>
      </a>
      <a href="/dashboard2">
        <div className="sidebar-item">Dashboard 2 (For Approval)</div>
      </a>
      <a href="/dashboard3">
        <div className="sidebar-item">Dashboard 3 (For Display)</div>
      </a>
    </div>
  );
};
