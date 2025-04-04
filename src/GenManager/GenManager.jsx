import React from "react";
import { Link } from "react-router-dom";
import './genmanager.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const GenManager = () => {
    return (
        <div className="gtv_home">
            <Navbar />
            <h1 style={{marginTop: '115px', textAlign: 'center'}}>General Manager Dashboard</h1>
            <div className="gtv_page-container">
                <div className="gtv_content">
                    <div className="gtv_links-grid">
                        <Link to="/" className="gtv_link-card">List of Quotation</Link>
                        <Link to="/" className="gtv_link-card">Job Order Form</Link>
                        <Link to="/" className="gtv_link-card">Bill of Materials</Link>
                        <Link to="/" className="gtv_link-card">Job Order Cost Sheet</Link>
                        <Link to="/" className="gtv_link-card">Purchase Requisition Form</Link>
                        <Link to="/" className="gtv_link-card">Purchase Order</Link>
                        <Link to="/" className="gtv_link-card">Request for Payment</Link>
                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default GenManager;
