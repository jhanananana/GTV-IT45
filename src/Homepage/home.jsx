import React from "react";
import { Link } from "react-router-dom";
import './home.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const Home = () => {
    return (
        <div className="home">
            <Navbar />
            <h1 style={{marginTop: '215px'}}>GTV: Liquidation Report Forms</h1>
            <div className="page-container">
                <div className="content">
                    <div className="links">
                        <Link to="/home" className="link">Home</Link>
                        <Link to="/genmanager" className="link">General Manager (Dashboard)</Link>
                        <Link to="/cashadvance" className="link">Cash Advance Request</Link>
                        <Link to="/liquidationreport" className="link">Liquidation Report</Link>
                        <Link to="/dashboard1" className="link">Dashboard 1</Link>
                        <Link to="/dashboard1" className="link">Dashboard 2</Link>
                        <Link to="/dashboard3" className="link">Dashboard 3 (Display)</Link>
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
