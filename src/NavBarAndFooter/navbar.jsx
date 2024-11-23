import React, { useState } from "react";
import "./navbarAndFooter.css";

export const Navbar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <header>
        <div>
          <ul>
            <li>
              <img
                onClick={toggleSidebar}
                className="hamburger"
                src="/images/hamburger.png"
                alt="hamburger"
              />
            </li>
            <li>
              <a href="/home">
                <img className="logo" src="/images/logo.png" alt="Logo" />
              </a>
            </li>
            <li>
              <a href="/home" className="shopName">
                Galanter & Jones SEA. INC. 
              </a>
            </li>
          </ul>
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
