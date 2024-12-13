import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../firebase";
import '../Dashboard1/Dashboard.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Footer from '../NavBarAndFooter/footer.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const Dashboard3 = () => {
    const [records, setRecords] = useState([]);
    const [liquidationIds, setLiquidationIds] = useState({});

    useEffect(() => {
        // Fetch Cash Advance records
        const unsubscribeCashAdvance = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Update the status based on isApproved and isAttached
            const updatedRecords = fetchedRecords.map(record => {
                let status = record.status;
            
                if (record.isApproved && record.isGMApproved && record.isAttached) {
                    status = "CLOSED (APPROVED)";
                } else if (record.isApproved && record.isGMApproved === true && !record.isAttached) {
                    status = "OPEN (GM Approved)";
                } else if (record.isApproved && record.isGMApproved === false) {
                    status = "CLOSED (GM Rejected)";
                } else if (record.isApproved && record.isGMApproved === null) {
                    status = "Pending (GM Review)";
                }
            
                return { ...record, status };
            });
            
            setRecords(updatedRecords);
        });

        // Fetch Liquidation records and map the Liquidation ID to Cash Advance ID
        const unsubscribeLiquidation = onSnapshot(collection(db, "Liquidation"), (snapshot) => {
            const liquidationRecords = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Create a mapping of Cash Advance ID to Liquidation ID
            const liquidationMap = liquidationRecords.reduce((acc, record) => {
                if (record.cashAdvanceId) {
                    acc[record.cashAdvanceId] = record.id;
                }
                return acc;
            }, {});

            setLiquidationIds(liquidationMap);
        });

        return () => {
            unsubscribeCashAdvance();
            unsubscribeLiquidation();
        };
    }, []);

    const getStatusClass = (status) => {
        switch (status.toUpperCase()) {
            case "CLOSED (APPROVED)":
                return "closed-approved";
            case "CLOSED (GM REJECTED)":
                return "closed-declined";
            case "OPEN (GM APPROVED)":
                return "open";
            case "PENDING (GM REVIEW)":
                return "pending-gm";
            case "CLOSED (REJECTED)":
                return "closed-declined";
            default:
                return "";
        }
    };

    // Legend for status indicators
    const Legend = () => (
        <div className="gtv_legend">
            <span className="gtv_legend-item gtv_open">Open (GM Approved)</span>
            <span className="gtv_legend-item gtv_closed-approved">Closed (Approved)</span>
            <span className="gtv_legend-item gtv_closed-declined">Closed (Declined)</span>
            <span className="gtv_legend-item gtv_pending-gm">Pending (GM Review)</span>
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
            <div className="gtv_dashboard-container">
                <div className="gtv_dashboard-left">
                    <div className="gtv_content" style={{ margin: "30px", boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
                        <table className="gtv_dashboard-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th className="gtv_th">Liquidation ID</th> {/* New column for Liquidation ID */}
                                    <th className="gtv_th">Cash Advance ID</th>
                                    <th className="gtv_th">Account Name</th>
                                    <th className="gtv_th">Cash Advance Amount</th>
                                    <th className="gtv_th">Status</th>
                                    <th className="gtv_th">Reason (For Rejected Requests)</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? (
                                    records.map((record) => (
                                        <tr key={record.id}>
                                            <td className="gtv_td">
                                                {liquidationIds[record.cashAdvanceId] || "N/A"} {/* Match Cash Advance ID to Liquidation ID */}
                                            </td>
                                            <td className="gtv_td">{record.cashAdvanceId}</td>
                                            <td className="gtv_td">{record.accountName}</td>
                                            <td className="gtv_td">{record.cashAdvAmount}</td>
                                            <td className={`gtv_status ${getStatusClass(record.status)}`}>
                                                {record.status}
                                            </td>
                                            <td className="gtv_td">{record.rejectionReason || " "}</td> {/* Display rejection reason if exists */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="gtv_td" colSpan="6" style={{textAlign: 'center'}}>No records to display.</td>
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
