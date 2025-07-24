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
import { CheckCircle, XCircle, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard1 = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;

  useEffect(() => {
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
          (error) => console.error("Error fetching Liquidation records: ", error)
        );

        return () => liquidationUnsubscribe();
      },
      (error) => console.error("Error fetching Cash Advance records: ", error)
    );

    return () => cashAdvanceUnsubscribe();
  }, []);

  const sortedRecords = [...records].sort((a, b) => {
    if (a.cashAdvanceId != null && b.cashAdvanceId != null) {
      return a.cashAdvanceId - b.cashAdvanceId;
    }
    return 0;
  });

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Liquidation Report", path: "/liquidationreport" },
    { label: "Dashboard 1", path: "/dashboard1" },
  ];

  const onSubmit = (data) => {
    if (!selectedRecordId) return alert("No record selected.");
    const updatedCashAdvAmount = data.cashAdvAmount;
    if (isNaN(updatedCashAdvAmount) || updatedCashAdvAmount <= 0) return alert("Invalid amount.");
    updateRecord(selectedRecordId, updatedCashAdvAmount);
  };

  const updateRecord = async (recordId, newAmount) => {
    try {
      const docRef = doc(db, "Cash Advance", recordId);
      await updateDoc(docRef, { cashAdvAmount: newAmount });
      alert("Amount updated successfully!");
    } catch (error) {
      console.error("Error updating amount: ", error);
      alert("Update failed.");
    }
  };

  const handleApprove = async () => {
    if (!selectedRecordId) return alert("No record selected.");
    const selectedRecord = records.find((record) => record.id === selectedRecordId);
    if (!selectedRecord?.cashAdvAmount) return alert("Set a valid amount first.");

    try {
      await updateDoc(doc(db, "Cash Advance", selectedRecordId), {
        status: "Pending GM Approval",
        isApproved: true,
        isGMApproved: null,
      });
      alert("Approved and sent for GM approval!");
      navigate("/dashboard2");
    } catch (error) {
      console.error("Error approving: ", error);
      alert("Approval failed.");
    }
  };

  const handleRejectSubmit = (reason) => {
    if (!selectedRecordId) return alert("No record selected.");
    if (!reason.trim()) return alert("Provide a rejection reason.");

    updateDoc(doc(db, "Cash Advance", selectedRecordId), {
      status: "CLOSED (Rejected)",
      isApproved: false,
      rejectionReason: reason,
      isAttached: false,
    })
      .then(() => {
        alert("Record rejected.");
        setRecords((prev) => prev.filter((r) => r.id !== selectedRecordId));
        setIsRejectPopupOpen(false);
        navigate("/dashboard3");
      })
      .catch((error) => {
        console.error("Rejection error:", error);
        alert("Rejection failed.");
      });
  };

  const handleRecordSelect = (recordId) => {
    setSelectedRecordId(recordId);
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    setValue("liquidationId", record.liquidationId || "");
    setValue("cashAdvAmount", record.cashAdvAmount || "");
    setValue("cashAdvanceId", record.cashAdvanceId || "");
    setValue("accountName", record.accountName || "");
  };

  const closeRejectPopup = () => setIsRejectPopupOpen(false);

  const filteredRecords = sortedRecords.filter((record) =>
    (record.isApproved === null || record.isApproved === undefined) &&
    (record.accountName?.toLowerCase().includes(searchText.toLowerCase()) ||
      record.cashAdvanceId?.toString().includes(searchText))
  );

  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

const uniqueCashIds = [...new Set(filteredRecords.map(r => r.cashAdvanceId).filter(Boolean))];
  const uniqueAccountNames = [...new Set(records.map(r => r.accountName).filter(Boolean))];

  return (
    <div>
      <Navbar />
      <div className="gtv_full-container">
        <Breadcrumbs links={breadcrumbsLinks} />
        <h1 className="gtv_rrHeader" style={{ textAlign: 'left' }}>Cash Advance Amount Records (Admin)</h1>

        <div className="gtv_dashboard-container">
          <div className="gtv_dashboard-left">

            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="gtv_dashboard-fields-2col"
              >
                <div className="gtv_dashboard-field"
                  style={{ maxWidth: 200 }}
                >
                  <label>Cash Advance ID</label>
                  <select
                    className="gtv_dashBoardInput"
                    {...register("cashAdvanceId")}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setValue("cashAdvanceId", selectedId);
                      const rec = records.find((r) => String(r.cashAdvanceId) === String(selectedId));
                      setValue("accountName", rec ? rec.accountName : "");
                      setSelectedRecordId(rec ? rec.id : null);
                    }}
                    value={records.find((r) => r.id === selectedRecordId)?.cashAdvanceId || ""}
                  >
                    <option value="">Select ID</option>
                    {uniqueCashIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gtv_dashboard-field"
                >
                  <label>Account Name</label>
                  <input
                    className="gtv_dashBoardInput"
                    value={records.find((r) => r.id === selectedRecordId)?.accountName || ""}
                    disabled
                    placeholder="Account Name"
                  />
                </div>
                <div className="gtv_dashboard-field">
                  <label htmlFor="cashAdvAmount">Amount</label>
                  <input
                    className="gtv_dashBoardInput"
                    id="cashAdvAmount"
                    type="number"
                    {...register("cashAdvAmount")}
                    placeholder="Enter amount..."
                    disabled={!selectedRecordId}
                  />
                </div>
              </div>

              <div className="gtv_dashboard1-buttons">
                <button
                  type="button"
                  className="gtv_btn reject"
                  onClick={() => setIsRejectPopupOpen(true)}
                >
                  <span className="icon-label">
                    <XCircle size={18} />
                    <span>Reject</span>
                  </span>
                </button>

                <button
                  type="button"
                  className="gtv_btn approve"
                  onClick={handleApprove}
                >
                  <span className="icon-label">
                    <CheckCircle size={18} />
                    <span>Approve</span>
                  </span>
                </button>

                <button
                  type="submit"
                  className="gtv_btnDB gtv_btnEdit"
                  disabled={!selectedRecordId}
                  style={{ marginLeft: "10px" }}
                >
                  <span className="icon-label">
                    <Edit size={18} />
                    <span>Set Amount</span>
                  </span>
                </button>
              </div>

            </form>

            <div className="gtv_dashboard-controls">
              <div className="gtv_search-wrapper">
                <Search size={18} className="gtv_search-icon" />
                <input
                  id="searchInput"
                  type="text"
                  className="gtv_search-input"
                  placeholder="Search by Cash Advance ID or Account Name..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>


              <div className="gtv_pagination">
                <button
                  className="gtv_page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} style={{ verticalAlign: 'middle' }} /> Previous
                </button>

                <span className="gtv_page-info">
                  Page <strong>{currentPage}</strong> of {totalPages} &nbsp;|&nbsp; {filteredRecords.length} results
                </span>

                <button
                  className="gtv_page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
                </button>
              </div>
            </div>

            <div className="gtv_content" style={{ width: '100%' }}>
              <div className="gtv_table">
                <table style={{ tableLayout: 'fixed', width: '100%'}}>
                  <thead>
                    <tr>
                      <th className="">Cash Advance ID</th>
                      <th className="gtv_sticky-header">Account Name</th>
                      <th className="gtv_sticky-header">Activity</th>
                      <th className="gtv_sticky-header">Cash Advance Amount</th>
                      <th className="gtv_sticky-header">Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: '1px solid red' }}>
                    {filteredRecords.length > 0 ? (
                      paginatedRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="gtv_td">{record.cashAdvanceId}</td>
                          <td className="gtv_td">{record.accountName}</td>
                          <td className="gtv_td">{record.activity}</td>
                          <td className="gtv_td">{record.cashAdvAmount}</td>
                          <td className="gtv_td">
                            <button type="button" className="gtv_btnDB gtv_btnEdit" onClick={() => handleRecordSelect(record.id)}>Select</button>
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

      {isRejectPopupOpen && selectedRecordId && (
        <div className="gtv_popup-overlay" onClick={closeRejectPopup}>
          <div className="gtv_popup-content">
            <ReasonForRejecting
              onCancel={closeRejectPopup}
              selectedRecord={records.find((record) => record.id === selectedRecordId)}
              onReject={handleRejectSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard1;
