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
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

    useEffect(() => {
        // Fetch Cash Advance records
        const unsubscribeCashAdvance = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const updatedRecords = fetchedRecords.map(record => {
                let status = record.status || 'ALL'; // Default to 'ALL' if status is missing

                if (record.isApproved && record.isGMApproved && record.isAttached) {
                    status = "CLOSED (APPROVED)";
                } else if (record.isApproved && record.isGMApproved === true && !record.isAttached) {
                    status = "OPEN (GM APPROVED)";
                } else if (!record.isApproved && !record.isGMApproved) {
                    status = "CLOSED (GM REJECTED)";
                } else if (record.isApproved && record.isAttached === false) {
                    status = "CLOSED (REJECTED)";
                } else if (record.isApproved === null || record.isGMApproved === null) {
                    status = "PENDING";
                }

                return { ...record, status };
            });

            setRecords(updatedRecords);
            setFilteredRecords(updatedRecords);  // Initially, all records are shown
        });

        // Fetch Liquidation records and map the Liquidation ID to Cash Advance ID
        const unsubscribeLiquidation = onSnapshot(collection(db, "Liquidation"), (snapshot) => {
            const liquidationMap = {};
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const caId = data.cashAdvanceId;
                if (caId) {
                    liquidationMap[caId] = doc.id;  // Map: cashAdvanceId -> liquidation doc ID
                }
            });
            setLiquidationIds(liquidationMap); // 👈 You should have this in useState
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
            case "PENDING":
                return "pending";
            case "CLOSED (REJECTED)":
                return "closed-declined";
            default:
                return "";
        }
    };

    const tabColors = {
        "ALL": "#4F46E5",
        "OPEN (GM APPROVED)": "#FACC15",
        "CLOSED (APPROVED)": "#22C55E",
        "CLOSED (GM REJECTED)": "#EF4444",
        "CLOSED (REJECTED)": "#EF4444",
        "PENDING": "#9CA3AF",
    };

    const filterRecords = (status) => {
        return records.filter((record) => {
            const isCashAdvance = !record.source || record.source === "cashAdvance"; // Assuming 'source' is undefined for Cash Advance
            const statusMatches = (status === "ALL" || (isCashAdvance && record.status === status));
            return statusMatches;
        });
    };


    const SearchBox = ({ placeholder, value, onChange }) => {
        return (
            <div className="nq-search-box-container">
                <div className="nq-search-box-icon">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    className="nq-search-box-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };

    const handleFilterChange = (status) => {
        setActiveStatusFilter(status);  // Update the selected filter

        // Filter records based on the selected status
        const filteredData = filterRecords(status);
        setFilteredRecords(filteredData);  // Update the filtered records list
    };

    const Legend = () => (
        <div>
            <div className="gtv_filter-tabs">
                {Object.entries(tabColors).map(([status, color]) => (
                    <button
                        key={status}
                        className={`gtv_tab ${status === activeStatusFilter ? "gtv_tab-active" : ""}`}
                        onClick={() => handleFilterChange(status)} // Only handle status filtering
                    >
                        <span
                            className="gtv_tab-indicator"
                            style={{ backgroundColor: color }}
                        ></span>
                        {status === "ALL" && "All"}
                        {status === "PENDING" && "Pending"}
                        {status === "OPEN (GM APPROVED)" && "Open (GM Approved)"}
                        {status === "CLOSED (APPROVED)" && "Closed (Approved)"}
                        {status === "CLOSED (GM REJECTED)" && "Closed (GM Rejected)"}
                        {status === "CLOSED (REJECTED)" && "Closed (Rejected)"}
                    </button>
                ))}
            </div>
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
            <div className="gtv_dashboard3-container">
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className="gtv_dashboard-container">
                    <div className="gtv_dashboard-left">
                        <h1 style={{ textAlign: 'left' }}>Cash Advance Status Dashboard</h1>
                        <Legend />

                        {/* <div className="nq-search-section">
                            <SearchBox
                            placeholder="Search by Quotation ID or customer name..."
                            // value={searchTerm}
                            // onChange={setSearchTerm}
                            />
                        </div> */}
                        <div className="nq-table">
                            <div className="nq-table-header">
                                <div className="nq-col nq-col-status">Status</div>
                                <div className="nq-col nq-col-liquidationId">Liquidation ID</div>
                                <div className="nq-col nq-col-cashAdvId">Cash Advance ID</div>
                                <div className="nq-col nq-col-name">Account Name</div>
                                <div className="nq-col nq-col-amount">Amount ($)</div>
                                <div className="nq-col nq-col-message" >Reason (For Rejected Requests)</div>
                            </div>
                            <div className="nq-table-body">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => {
                                        const liquidationId = liquidationIds[record.cashAdvanceId] || "N/A";  // Default to "N/A" if no liquidationId is found

                                        return (
                                            <div key={record.id} className="nq-table-row">
                                                <td className={`nq-col nq-col-status gtv_status ${getStatusClass(record.status)}`}>
                                                    {record.status}
                                                </td>
                                                <div className="nq-col nq-col-liquidationId">
                                                    {liquidationId}  {/* Always display liquidationId (or "N/A" if not available) */}
                                                </div>
                                                <div className="nq-col nq-col-cashAdvId">{record.cashAdvanceId}</div>
                                                <div className="nq-col nq-col-name">{record.accountName}</div>
                                                <div className="nq-col nq-col-amount">$ {record.cashAdvAmount}</div>
                                                <div className="nq-col nq-col-message">{record.rejectionReason || " "}</div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="nq-table-row">
                                        <div className="nq-col" colSpan="6" style={{ textAlign: 'center' }}>
                                            No records to display.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard3;
