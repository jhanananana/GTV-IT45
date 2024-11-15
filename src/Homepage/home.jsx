// basic packages
import React from "react";
import { Link } from "react-router-dom";

// styling imports
import './home.css';

// Import Navbar and Footer components
import Navbar from '../NavBarAndFooter/navbar.jsx'; 
import Footer from '../NavBarAndFooter/footer.jsx'; 

const Home = () => {
    return (
        <div className="home">
            {/* Render Navbar */}
            <Navbar />
            <div className="page-container">
                <div className="content">
                    <div className="links">
                        <Link to="/home" className="link">Home</Link>
                        <Link to="/liquidationreport" className="link">Liquidation Report</Link>
                    </div>
                </div>
            </div>
            {/* Render Footer */}
            <Footer />
        </div>
    );
};

export default Home;
