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

const Dashboard1 = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);

  useEffect(() => {
    // Listen to Cash Advance collection
    const cashAdvanceUnsubscribe = onSnapshot(
      collection(db, "Cash Advance"),
      (snapshot) => {
        const fetchedCashAdvRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const liquidationUnsubscribe = onSnapshot(
          collection(db, "Liquidation"),
          (snapshot) => {
            const fetchedLiquidationRecords = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const mergedRecords = fetchedCashAdvRecords.map((cashAdvRecord) => {
              const relatedLiquidation = fetchedLiquidationRecords.find(
                (liquidation) => liquidation.liquidationID === cashAdvRecord.liquidationId
              );
              return {
                ...cashAdvRecord,
                liquidationDetails: relatedLiquidation || {},
              };
            });

            setRecords(mergedRecords);
          },
          (error) => {
            console.error("Error fetching Liquidation records: ", error);
          }
        );

        return () => liquidationUnsubscribe();
      },
      (error) => {
        console.error("Error fetching Cash Advance records: ", error);
      }
    );

    return () => cashAdvanceUnsubscribe();
  }, []);

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Liquidation Report", path: "/liquidationreport" },
    { label: "Dashboard 1", path: "/dashboard1" },
  ];

  const onSubmit = (data) => {
    if (!selectedRecordId) {
      alert("No record selected.");
      return;
    }

    const updatedCashAdvAmount = data.cashAdvAmount;
    if (isNaN(updatedCashAdvAmount) || updatedCashAdvAmount <= 0) {
      alert("Please enter a valid cash advance amount.");
      return;
    }

    updateRecord(selectedRecordId, updatedCashAdvAmount);
  };

  const updateRecord = async (recordId, newAmount) => {
    try {
      const docRef = doc(db, "Cash Advance", recordId);
      await updateDoc(docRef, { cashAdvAmount: newAmount });
      alert("Amount updated successfully!");
    } catch (error) {
      console.error("Error updating Cash Advance amount: ", error);
      alert("Failed to update amount. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (!selectedRecordId) {
      alert("No record selected. Please select a record to approve.");
      return;
    }

    const selectedRecord = records.find((record) => record.id === selectedRecordId);

    if (!selectedRecord || !selectedRecord.cashAdvAmount) {
      alert("Please set a valid Cash Advance Amount before approving.");
      return;
    }

    try {
      const docRef = doc(db, "Cash Advance", selectedRecordId);
      await updateDoc(docRef, {
        status: "Pending GM Approval", // Updated status for GM review
        isApproved: true, // Indicates Admin has approved
        isGMApproved: null, // Initialize GM approval field
      });

      alert("Record approved successfully and sent for GM approval!");
      navigate("/dashboard2");
    } catch (error) {
      console.error("Error approving the record: ", error);
      alert("Failed to approve the record. Please try again.");
    }
  };

  const handleRejectSubmit = (reason) => {
    if (!selectedRecordId) {
      alert("No records selected for rejection. Please select a record to reject.");
      return;
    }

    if (!reason || reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }

    updateDoc(doc(db, "Cash Advance", selectedRecordId), {
      status: "CLOSED (Rejected)",
      isApproved: false,
      rejectionReason: reason,
      isAttached: false,
    })
      .then(() => {
        alert("Record rejected successfully!");
        setRecords((prevRecords) => {
          const updatedRecords = prevRecords.filter((record) => record.id !== selectedRecordId);
          console.log("After rejection update:", updatedRecords);
          return updatedRecords;
        });
        setIsRejectPopupOpen(false);
        navigate("/dashboard3");
      })
      .catch((error) => {
        console.error("Error rejecting the record:", error);
        alert("Failed to reject the record. Please try again.");
      });
  };

  const handleRecordSelect = (recordId) => {
    setSelectedRecordId(recordId);
    const record = records.find((r) => r.id === recordId);

    setValue("liquidationId", record.liquidationId || "");
    setValue("cashAdvAmount", record.cashAdvAmount || "");
    setValue("cashAdvanceId", record.cashAdvanceId || "");
    setValue("accountName", record.accountName || "");
  };

  const closeRejectPopup = () => {
    setIsRejectPopupOpen(false);
  };

  const filteredRecords = records.filter(
    (record) => record.isApproved === null || record.isApproved === undefined
  );

  return (
    <div>
      <Navbar />

      <div className="gtv_full-container">
          <Breadcrumbs links={breadcrumbsLinks} />
          <h1 className="gtv_rrHeader" style={{ textAlign: 'left' }}>Cash Advance Amount Records (Admin)</h1>

        {/* Left Side Form */}
        <div className="gtv_dashboard-container">
          <div className="gtv_dashboard-left">
            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="gtv_dashboard-group">
                <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
                <input
                  disabled={true}
                  className="gtv_dashBoardInput"
                  id="cashAdvanceId"
                  type="text"
                  {...register("cashAdvanceId")}
                  readOnly
                />
              </div>

              <div className="gtv_dashboard-group">
                <label htmlFor="accountName">Account Name:</label>
                <input
                  disabled={true}
                  className="gtv_dashBoardInput"
                  id="accountName"
                  type="text"
                  {...register("accountName")}
                  readOnly
                />
              </div>

              {/* Cash Advance Amount */}
              {selectedRecordId && (
                <div className="gtv_dashboard-group">
                  <label htmlFor="cashAdvAmount">Cash Advance Amount:</label>
                  <input
                    className="gtv_dashBoardInput" style={{ width: '250px' }}
                    id="cashAdvAmount"
                    type="number"
                    {...register("cashAdvAmount")}
                    placeholder="Enter cash advance amount..."
                  />

                  {selectedRecordId && (
                    <button type="submit" style={{ marginLeft: "10px" }} className="gtv_btnDB gtv_btnEdit">Set Amount</button>
                  )}
                </div>
              )}
              <div className="gtv_dashboard1-buttons">
                <button type="button" className="gtv_btn reject" onClick={() => setIsRejectPopupOpen(true)}>Reject</button>
                <button type="button" className="gtv_btn approve" onClick={handleApprove}>Approve</button>
              </div>
            </form>

            {/* Display Records */}
            <div className="gtv_content" style={{width: '100%'}}>
              <div className="gtv_table">
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th className="gtv_th">Cash Advance ID</th>
                      <th className="gtv_th">Account Name</th>
                      <th className="gtv_th">Activity</th>
                      <th className="gtv_th">Cash Advance Amount</th>
                      <th className="gtv_th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="gtv_td">{record.cashAdvanceId}</td>
                          <td className="gtv_td">{record.accountName}</td>
                          <td className="gtv_td">{record.activity}</td>
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
                        <td colSpan="6" style={{ textAlign: "center" }}>No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
      {/* Rejection Reason Popup */}
      {isRejectPopupOpen && selectedRecordId && (
        <div className="gtv_popup-overlay" onClick={() => setIsRejectPopupOpen(false)}>
          <div className="gtv_popup-content">
            <ReasonForRejecting
              onCancel={() => setIsRejectPopupOpen(false)}
              selectedRecord={records.find((record) => record.id === selectedRecordId)} // Find the record using selectedRecordId
              onReject={handleRejectSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard1;
