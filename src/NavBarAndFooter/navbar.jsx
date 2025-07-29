import React, { useState } from "react";

export const Navbar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <header className="w-full relative z-50 border border-white mb-24">
        <div className="w-full h-[55px] md:h-[60px] lg:h-[65px] flex items-center justify-between bg-white shadow-sm px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <img
              onClick={toggleSidebar}
              className="w-[60px] mr-2 cursor-pointer md:hidden"
              src="/hamburger.png"
              alt="hamburger"
            />
            <a href="/home">
              <img className="w-[45px] h-[45px] object-contain md:w-[50px] md:h-[50px] lg:w-[55px] lg:h-[55px]" src="/logo.png" alt="Logo" />
            </a>
            <a href="/home" className="font-semibold text-sm text-[#263145]">
              Galanter and Jones
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
    <div className="w-full max-w-[250px] h-screen bg-white/95 fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out">
      <a href="/home">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Home
        </div>
      </a>
      <a href="/liquidationreport">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Liquidation Form
        </div>
      </a>
      <a href="/cashadvance">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Cash Advance Request
        </div>
      </a>
      <a href="/dashboard1">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Dashboard 1 (For Input & Approval)
        </div>
      </a>
      <a href="/dashboard2">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Dashboard 2 (For Approval)
        </div>
      </a>
      <a href="/dashboard3">
        <div className="w-[370px] py-6 px-[100px] text-[#263145] text-xl font-medium hover:bg-[#263145] hover:text-white transition">
          Dashboard 3 (For Display)
        </div>
      </a>
    </div>
  );
};
