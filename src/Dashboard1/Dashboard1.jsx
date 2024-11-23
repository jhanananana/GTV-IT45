import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "../firebase"; // Import your Firebase configuration
import './Dashboard1.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Footer from '../NavBarAndFooter/footer.jsx'; 
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReasonForRejecting from '../ReasonforRejecting/ReasonforRejecting.jsx'; // Import the component
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const Dashboard1 = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]); // State to store records
  const [selectedRecordId, setSelectedRecordId] = useState(null); // Store selected record id for updating
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false); // Popup state

  useEffect(() => {
    // Fetch records from the "Cash Advance" collection
    const cashAdvanceUnsubscribe = onSnapshot(
      collection(db, "Cash Advance"),
      (snapshot) => {
        const fetchedCashAdvRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch records from the "Liquidation Report" collection
        const liquidationUnsubscribe = onSnapshot(
          collection(db, "Liquidation"),
          (snapshot) => {
            const fetchedLiquidationRecords = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Merge Cash Advance and Liquidation data based on liquidationId
            const mergedRecords = fetchedCashAdvRecords.map((cashAdvRecord) => {
              const relatedLiquidation = fetchedLiquidationRecords.find(
                (liquidation) => liquidation.liquidationID === cashAdvRecord.liquidationId
              );
              return {
                ...cashAdvRecord,
                liquidationDetails: relatedLiquidation || {},
              };
            });

            setRecords(mergedRecords); // Set merged records to state
          },
          (error) => {
            console.error("Error fetching Liquidation records: ", error);
          }
        );

        // Cleanup for Liquidation listener
        return () => {
          cashAdvanceUnsubscribe();
          liquidationUnsubscribe();
        };
      },
      (error) => {
        console.error("Error fetching Cash Advance records: ", error);
      }
    );

    // Cleanup function for Cash Advance listener
    return () => {
      cashAdvanceUnsubscribe();
    };
  }, []);

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Liquidation Report", path: "/liquidationreport" },
    { label: "Dashboard 1", path: "/dashboard1" },
  ];

  const onSubmit = (data) => {
    if (selectedRecordId) {
      const updatedRecord = records.find((record) => record.id === selectedRecordId);
      const updatedCashAdvAmount = data.cashAdvAmount;

      // Update the selected record with the new cash advance amount
      updateRecord(selectedRecordId, updatedCashAdvAmount);
    }
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
      await updateDoc(docRef, { status: "Approved" });
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== selectedRecordId)
      );

      alert("Record approved successfully!");
      navigate("/dashboard2"); 
    } catch (error) {
      console.error("Error approving the record: ", error);
      alert("Failed to approve the record. Please try again.");
    }
  };

  const handleReject = () => {
    if (!selectedRecordId) {
      alert("No record selected. Please select a record to reject.");
      return; 
    }

    setIsRejectPopupOpen(true); 
  };

  const handleRecordSelect = (recordId) => {
    setSelectedRecordId(recordId);
    const record = records.find((r) => r.id === recordId);

    // Set form fields with selected record details
    setValue("liquidationId", record.liquidationId || ""); 
    setValue("cashAdvAmount", record.cashAdvAmount || "");
    setValue("cashAdvanceId", record.cashAdvanceId || "");  
    setValue("accountName", record.accountName || ""); 
  };

  const closeRejectPopup = () => {
    setIsRejectPopupOpen(false);
  };

  const handleRejectSubmit = (reason) => {
    updateDoc(doc(db, "Cash Advance", selectedRecordId), {
      status: 'Rejected',
      rejectionReason: reason,
    })
      .then(() => {
        setIsRejectPopupOpen(false);
        alert("Record rejected successfully.");
        navigate("/dashboard3"); 
      })
      .catch((error) => {
        console.error("Error rejecting the record: ", error);
        alert("Failed to reject the record. Please try again.");
      });
  };

  // Filter out approved and rejected records
  const filteredRecords = records.filter(
    (record) => record.status !== "Approved" && record.status !== "Rejected"
  );

  return (
    <div>
      <Navbar />
      <Breadcrumbs links={breadcrumbsLinks} />
      <h1 style={{ textAlign: 'left', marginLeft: '40px' }}>Cash Advance Amount Records</h1>

      {/* Left Side */}
      <div className="dashboard-container">
        <div className="dashboard-left ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="dashboard-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input
                disabled={true}
                className="dashBoardInput"
                id="liquidationId"
                type="text"
                {...register("liquidationId")}
                readOnly
              />
            </div>

            <div className="dashboard-group">
              <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
              <input
                disabled={true}
                className="dashBoardInput"
                id="cashAdvanceId"
                type="text"
                {...register("cashAdvanceId")}
                readOnly
              />
            </div>

            <div className="dashboard-group">
              <label htmlFor="accountName">Account Name:</label>
              <input
                disabled={true}
                className="dashBoardInput"
                id="accountName"
                type="text"
                {...register("accountName")}
                readOnly
              />
            </div>

            {/* Cash Advance Amount */}
            {selectedRecordId && (
              <div className="dashboard-group">
                <label htmlFor="cashAdvAmount">Cash Advance Amount:</label>
                <input
                  className="dashBoardInput" style={{ width: '250px' }}
                  id="cashAdvAmount"
                  type="number"
                  {...register("cashAdvAmount")}
                  placeholder="Enter cash advance amount..."
                />

                {selectedRecordId && (
                  <button type="submit" style={{ marginLeft: "10px" }} className="btnEdit">Set Amount</button>
                )}
              </div>
            )}
            <div className="dashboard1-buttons">
              <button type="button" className="btn reject" onClick={handleReject}>Reject</button>
              <button type="button" className="btn approve" onClick={handleApprove}>Approve</button>
            </div>
          </form>
        </div>
      </div>

      {/* Table to display filtered records */}
      <div className="content" style={{ margin: "30px" }}>
        <div className="tables">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Liquidation ID</th>
                <th>Cash Advance ID</th>
                <th>Account Name</th>
                <th>Activity</th>
                <th>Cash Advance Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.liquidationDetails.liquidationID}</td>
                    <td>{record.cashAdvanceId}</td>
                    <td>{record.accountName}</td>
                    <td>{record.activity}</td>
                    <td>{record.cashAdvAmount}</td>
                    <td>
                      <button
                        type="button"
                        className="btnEdit"
                        style={{ justifyContent: "flex-end" }}
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
      </div>

      {isRejectPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <ReasonForRejecting
              onCancel={closeRejectPopup}
              selectedRecord={records.find((record) => record.id === selectedRecordId)}
              onReject={handleRejectSubmit}  
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard1;
