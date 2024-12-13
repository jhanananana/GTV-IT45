import React from "react";
import { Link } from "react-router-dom";
import './home.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const Home = () => {
    return (
        <div className="gtv_home">
            <Navbar />
            <h1 style={{marginTop: '215px'}}>GTV: Liquidation Report Forms</h1>
            <div className="gtv_page-container">
                <div className="gtv_content">
                    <div className="gtv_links">
                        <Link to="/home" className="gtv_link">Home</Link>
                        <Link to="/genmanager" className="gtv_link">General Manager (Dashboard)</Link>
                        <Link to="/cashadvance" className="gtv_link">Cash Advance Request</Link>
                        <Link to="/liquidationreport" className="gtv_link">Liquidation Report</Link>
                        <Link to="/dashboard1" className="gtv_link">Dashboard 1</Link>
                        <Link to="/dashboard1" className="gtv_link">Dashboard 2</Link>
                        <Link to="/dashboard3" className="gtv_link">Dashboard 3 (Display)</Link>
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
