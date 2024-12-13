import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "../firebase";
import '../Dashboard1/Dashboard.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Footer from '../NavBarAndFooter/footer.jsx';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReasonForRejecting from '../ReasonforRejecting/ReasonforRejecting.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const Dashboard2 = () => {
    const { register, setValue } = useForm();
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter out approved or rejected records
            const filteredRecords = fetchedRecords.filter(
                record => record.isApproved === true && record.isGMApproved === null
            );
            setRecords(filteredRecords);
        });

        return () => unsubscribe();
    }, []);

    const handleApprove = async () => {
        if (!selectedRecord) {
            alert("No record selected. Please select a record to approve.");
            return;
        }

        try {
            await updateDoc(doc(db, "Cash Advance", selectedRecord.id), {
                status: "OPEN (GM Approved)", // Updated status
                isGMApproved: true,          // Approved by GM
                isAttached: false,
            });

            alert("Record approved by GM!");

            // Remove approved record from the list
            setRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== selectedRecord.id)
            );

        } catch (error) {
            console.error("Error approving record:", error);
            alert("Failed to approve record.");
        }
    };

    const handleReject = async (reason) => {
        if (!selectedRecord) {
            alert("No record selected for rejection. Please select a record to reject.");
            return;
        }

        if (!reason || reason.trim() === "") {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            await updateDoc(doc(db, "Cash Advance", selectedRecord.id), {
                status: "CLOSED (GM Rejected)",
                isGMApproved: false,
                rejectionReason: reason,
                isAttached: false,
            });

            alert("Record rejected by GM!");
            setRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== selectedRecord.id)
            );
            navigate("/dashboard3");
        } catch (error) {
            console.error("Error rejecting record:", error);
            alert("Failed to reject record. Please try again.");
        }
    };

    const handleRecordSelect = (recordId) => {
        const record = records.find((r) => r.id === recordId);
        setSelectedRecord(record);
        setValue("cashAdvAmount", record.cashAdvAmount || "");
        setValue("cashAdvanceId", record.cashAdvanceId || "");
        setValue("accountName", record.accountName || "");
    };

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Liquidation Report", path: "/liquidationreport" },
        { label: "Dashboard 1", path: "/dashboard1" },
        { label: "Dashboard 2", path: "/dashboard2" },
    ];

    return (
        <div>
            <Navbar />
            <Breadcrumbs links={breadcrumbsLinks} />
            <h1 style={{ textAlign: 'left', marginLeft: '40px' }}>Cash Advance Amount Records</h1>
            <div className="gtv_dashboard-container">
                <div className="gtv_dashboard-left">
                    <form>
                        <div className="gtv_dashboard-group">
                            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
                            <input disabled className="gtv_dashBoardInput" {...register("cashAdvanceId")} readOnly />
                        </div>
                        <div className="gtv_dashboard-group">
                            <label htmlFor="accountName">Account Name:</label>
                            <input disabled className="gtv_dashBoardInput" {...register("accountName")} readOnly />
                        </div>
                        <div className="gtv_dashboard-group">
                            <label htmlFor="cashAdvAmount">Cash Advance Amount:</label>
                            <input disabled className="gtv_dashBoardInput" {...register("cashAdvAmount")} readOnly />
                        </div>
                        <div className="gtv_dashboard1-buttons">
                            <button type="button" className="gtv_btn reject" onClick={() => setIsRejectPopupOpen(true)}>Reject</button>
                            <button type="button" className="gtv_btn approve" onClick={handleApprove}>Approve</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="gtv_content" style={{ margin: "30px", boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <table className="gtv_dashboard-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="gtv_th">Cash Advance ID</th>
                            <th className="gtv_th">Account Name</th>
                            <th className="gtv_th">Cash Advance Amount</th>
                            <th className="gtv_th">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? (
                            records.map((record) => (
                                <tr key={record.id}>
                                    <td className="gtv_td">{record.cashAdvanceId}</td>
                                    <td className="gtv_td">{record.accountName}</td>
                                    <td className="gtv_td">{record.cashAdvAmount}</td>
                                    <td className="gtv_td">
                                        <button
                                            type="button"
                                            className="gtv_btnDB gtv_btnEdit"
                                            onClick={() => handleRecordSelect(record.id)}
                                        >
                                            Select Row
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>No records to show.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Footer />
            {isRejectPopupOpen && selectedRecord && (
                <div className="gtv_popup-overlay" onClick={() => setIsRejectPopupOpen(false)}>
                    <div className="gtv_popup-content">
                        <ReasonForRejecting
                            onCancel={() => setIsRejectPopupOpen(false)}
                            selectedRecord={selectedRecord}
                            onReject={handleReject}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard2;
