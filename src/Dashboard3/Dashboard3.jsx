import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../firebase";
import './Dashboard3.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Footer from '../NavBarAndFooter/footer.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const Dashboard3 = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((record) => record.status === "Approved" || record.status === "Rejected"); 

            setRecords(fetchedRecords);
        });

        return () => unsubscribe();
    }, []);

    // Legend for status indicators
    const Legend = () => (
        <div className="legend">
            <span className="legend-item open">Open</span>
            <span className="legend-item closed-approved">Closed (Approved)</span>
            <span className="legend-item closed-declined">Closed (Declined)</span>
        </div>
    );

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Liquidation Report", path: "/liquidationreport" },
        { label: "Dashboard 1", path: "/dashboard1" },
        { label: "Dashboard 2", path: "/dashboard2" },
        { label: "Dashboard 3", path: "/dashboard3" },
    ];

    return (
        <div>
            <Navbar />
            <Breadcrumbs links={breadcrumbsLinks} /> 
            <h1 style={{ textAlign: 'left', marginLeft: '40px' }}>Cash Advance Status Dashboard</h1>

            <Legend />
            <div className="dashboard-container">
                <div className="dashboard-left">
                    <div className="content" style={{ margin: "30px" }}>
                        <table className="dashboard-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Cash Advance ID</th>
                                    <th>Account Name</th>
                                    <th>Cash Advance Amount</th>
                                    <th>Status</th>
                                    <th>Reason</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? (
                                    records.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.cashAdvanceId}</td>
                                            <td>{record.accountName}</td>
                                            <td>{record.cashAdvAmount}</td>
                                            <td>{record.status}</td>
                                            <td>{record.rejectionReason || "N/A"}</td> 
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard3;