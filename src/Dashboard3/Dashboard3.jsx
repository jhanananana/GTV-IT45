import React from "react";
import { useForm } from "react-hook-form"; // Hook for form handling
import './Dashboard3.css';
import Navbar from '../NavBarAndFooter/navbar.jsx'; 

const Dashboard3 = () => {
    const { register, handleSubmit } = useForm(); // Initialize useForm hook

    const onSubmit = (data) => {
        console.log(data); // Handle form submission
    };

    return (
        <div><Navbar />
            <h1 style={{ textAlign: 'left', marginLeft: '40px' }}>Cash Advance Status Dashboard</h1>
            <div className="content">
                <div className="title-part">
                </div>
                <div className="tables">
                    <Section
                        columns={[
                            "Liquidation ID",
                            "Cash Advance ID",
                            "Account Name",
                            "Cash Advance Amount",
                        ]}
                    />
                </div>
            </div>
            <div className="dashboard-buttons">
        <button type="button" className="btn cancel">Close</button>
    </div>
        </div>
    );
};

// Section component for displaying table
const Section = ({ title, columns }) => (
    <div className="section">
        <div className="section-header">
            <h3>{title}</h3>
            <Legend />
        </div>
        <table>
            <thead>
                <tr>
                    {columns.map((column, index) => (
                        <th key={index}>{column}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {columns.map((_, index) => (
                        <td key={index}></td>
                    ))}
                </tr>
                <tr>
                    {columns.map((_, index) => (
                        <td key={index}></td>
                    ))}
                </tr>
                <tr>
                    {columns.map((_, index) => (
                        <td key={index}></td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);

// Legend for status indicators
const Legend = () => (
    <div className="legend">
        <span className="legend-item open">Open</span>
        <span className="legend-item closed-approved">Closed (Approved)</span>
        <span className="legend-item closed-declined">Closed (Declined)</span>
    </div>
);

export default Dashboard3;