import React from "react";
import { Link } from "react-router-dom";
import './genmanager.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const GenManager = () => {
    return (
        <div className="home">
            <Navbar />
            <h1 style={{marginTop: '215px'}}>General Manager</h1>
            <div className="page-container">
                <div className="content">
                    <div className="links">
                        <Link to="/" className="link">List of Quotation</Link>
                        <Link to="/" className="link">Job Order Form</Link>
                        <Link to="/" className="link">Bill of Materials</Link>
                        <Link to="/" className="link">Job Order Cost Sheet</Link>
                        <Link to="/" className="link">Purchase Requisition Form</Link>
                        <Link to="/" className="link">Purchase Order</Link>
                        <Link to="/" className="link">Request for Payment</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GenManager;
