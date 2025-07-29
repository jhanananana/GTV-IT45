import React from "react";
import { Link } from "react-router-dom";
import Navbar from './NavBarAndFooter/navbar.jsx'; 
// import Footer from '../NavBarAndFooter/footer.jsx';

const GeneralManager = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <h1 className="mt-[115px] text-center text-2xl font-semibold">General Manager Dashboard</h1>
      
      <div className="px-4 py-10">
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-5 text-center w-full justify-items-center">
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            List of Quotation
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Job Order Form
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Bill of Materials
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Job Order Cost Sheet
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Purchase Requisition Form
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Purchase Order
          </Link>
          <Link to="/" className="bg-[#263145] text-white p-10 h-[60px] rounded-xl w-[180px] flex justify-center items-center text-base no-underline transition-colors duration-300 hover:bg-[#1e2a3a]">
            Request for Payment
          </Link>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default GeneralManager;
