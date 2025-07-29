import React from "react";
import { Link } from "react-router-dom";
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';

const GTV_Home = () => {
    return (
        <div className="flex flex-col min-h-screen font-poppins bg-gray-100">
            <Navbar />
            <div className="flex-1 px-4 sm:px-6 md:px-8">
                <div className="max-w-6xl mx-auto py-8">
                    <h1 className="text-2xl font-semibold text-gray-800 mt-32 text-center">
                        GTV: Liquidation & Receiving Report Forms
                    </h1>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-6 bg-white shadow-md mt-10 rounded-lg">
                        <Link to="/home" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Home
                        </Link>

                        <Link to="/genmanager" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            General Manager
                            <p className="text-sm opacity-80">Dashboard</p>
                        </Link>

                        <Link to="/cashadvance" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Cash Advance Request Form
                            <p className="text-sm opacity-80">Cash Request Form (Prop Custodian)</p>
                        </Link>

                        <Link to="/liquidationreport" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Liquidation Report
                            <p className="text-sm opacity-80">Sending of Report (Prop Custodian)</p>
                        </Link>

                        <Link to="/admin" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Cash Advance Amount Dashboard
                            <p className="text-sm opacity-80">Approval of pending requests (Admin)</p>
                        </Link>

                        <Link to="/generalmanager" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Cash Advance Requests Dashboard 
                            <p className="text-sm opacity-80">Approval of initially approved requests</p>
                        </Link>

                        <Link to="/propcustodian" className="bg-[#263145] text-white rounded-lg p-4 hover:-translate-y-1 transition duration-200 shadow hover:shadow-lg">
                            Dashboard - All Records
                            <p className="text-sm opacity-80">Status of Requests (Prop Custodian)</p>
                        </Link>

                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default GTV_Home;
