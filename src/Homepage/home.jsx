// basic packages
import React from "react";
import { Link } from "react-router-dom";

// styling imports
import './home.css';

const Home = () => {
    return (
        <div className="home">
            {/* <Navbar /> */}
            <div className="page-container">
                <div className="content">
                    <div className="links">
                        <Link to="/home" className="link">Home</Link>
                        <Link to="/liquidationreport" className="link">Liquidation Report</Link>
                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
