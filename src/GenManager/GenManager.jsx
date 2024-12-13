import React from "react";
import { Link } from "react-router-dom";
import './genmanager.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const GenManager = () => {
    return (
        <div className="gtv_home">
            <Navbar />
            <h1 style={{marginTop: '215px'}}>General Manager</h1>
            <div className="gtv_page-container">
                <div className="gtv_content">
                    <div className="gtv_links">
                        <Link to="/" className="gtv_link">List of Quotation</Link>
                        <Link to="/" className="gtv_link">Job Order Form</Link>
                        <Link to="/" className="gtv_link">Bill of Materials</Link>
                        <Link to="/" className="gtv_link">Job Order Cost Sheet</Link>
                        <Link to="/" className="gtv_link">Purchase Requisition Form</Link>
                        <Link to="/" className="gtv_link">Purchase Order</Link>
                        <Link to="/" className="gtv_link">Request for Payment</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GenManager;
