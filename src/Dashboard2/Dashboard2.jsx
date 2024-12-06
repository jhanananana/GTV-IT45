import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "../firebase";
import './Dashboard2.css';
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
            const filteredRecords = fetchedRecords.filter(record => record.isApproved !== true && record.isApproved !== false);
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
                status: "OPEN (Approved)", 
                isApproved: true, 
                isAttached: false,
            });
    
            // Refetch records after updating the status
            const unsubscribe = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
                const fetchedRecords = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
    
                const approvedRecords = fetchedRecords.filter(record => record.isApproved === true && record.isAttached === false);
                setRecords(approvedRecords);
            });
    
            alert("Record approved successfully!");
            navigate("/dashboard2"); 
    
            return () => unsubscribe();
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
    
        setIsRejectPopupOpen(true);
    
        try {
            const updatedData = {
                status: "Rejected",
                rejectionReason: reason,
                isApproved: false, 
                isAttached: false, 
            };
    
            await updateDoc(doc(db, "Cash Advance", selectedRecord.id), updatedData);
            setRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== selectedRecord.id)
            );
    
            alert("Record rejected successfully!");
            navigate("/dashboard3"); 
        } catch (error) {
            console.error("Error rejecting record:", error);
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
            <div className="dashboard-container">
                <div className="dashboard-left">
                    <form>
                        <div className="dashboard-group">
                            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
                            <input disabled className="dashBoardInput" {...register("cashAdvanceId")} readOnly />
                        </div>
                        <div className="dashboard-group">
                            <label htmlFor="accountName">Account Name:</label>
                            <input disabled className="dashBoardInput" {...register("accountName")} readOnly />
                        </div>
                        <div className="dashboard-group">
                            <label htmlFor="cashAdvAmount">Cash Advance Amount:</label>
                            <input disabled className="dashBoardInput" {...register("cashAdvAmount")} readOnly />
                        </div>
                        <div className="dashboard1-buttons">
                            <button type="button" className="btn reject" onClick={handleReject}>Reject</button>
                            <button type="button" className="btn approve" onClick={handleApprove}>Approve</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="content" style={{ margin: "30px", boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Cash Advance ID</th>
                            <th>Account Name</th>
                            <th>Cash Advance Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? (
                            records.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.cashAdvanceId}</td>
                                    <td>{record.accountName}</td>
                                    <td>{record.cashAdvAmount}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btnEdit"
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
            {isRejectPopupOpen && selectedRecord && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <ReasonForRejecting
                            onCancel={() => setIsRejectPopupOpen(false)}
                            selectedRecord={selectedRecord}
                            onReject={handleReject}
                        />
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Dashboard2;
