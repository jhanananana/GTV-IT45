import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import db from "./firebase.js";
import Navbar from './NavBarAndFooter/navbar.jsx';
// import Footer from './NavBarAndFooter/footer.jsx'; // This was unused
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle, XCircle, FileX, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal.jsx';

const Dashboard_Admin = () => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  // State variables for the new flow
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const [showApproveAmount, setShowApproveAmount] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [formWarning, setFormWarning] = useState('');

  // This line is the key! `watch` from react-hook-form
  // automatically gets the current value of the "cashAdvAmount" input field.
  const approvedAmount = watch("cashAdvAmount");

  // Inline Notification Component
  const InlineNotification = ({ type = "info", message, onDismiss }) => {
    if (!message) return null;
    const styles = {
      success: "bg-green-100 border-green-300 text-green-700",
      error: "bg-red-100 border-red-300 text-red-700",
      info: "bg-blue-100 border-blue-300 text-blue-700",
      warning: "bg-yellow-100 border-yellow-300 text-yellow-700",
    };
    const icons = {
      success: <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-500" />,
      error: <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />,
      info: <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />,
      warning: <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-500" />,
    };
    return (
      <div className={`flex items-start gap-2 mx-0 mb-5 border px-4 py-3 rounded-md relative ${styles[type]}`}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-xl text-gray-400 hover:text-gray-700 focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  // Trigger confirmation modal for approval
  const handleSaveApprovedAmountClick = () => {
    if (!selectedRecordId) {
      setFormWarning("No record selected!");
      setTimeout(() => setFormWarning(''), 3000);
      return;
    }
    setShowSaveConfirm(true);
  };

  // Handle final approval after confirmation
  const handleConfirmSaveApprovedAmount = async () => {
    const selectedRecord = records.find(r => r.id === selectedRecordId);
    if (!selectedRecord) return;
    const newAmount = watch("cashAdvAmount");

    try {
      await updateDoc(doc(db, "Cash Advance", selectedRecordId), {
        status: "Pending GM Approval",
        isApproved: true,
        isGMApproved: null,
        cashAdvAmount: newAmount,
      });

      await setDoc(doc(db, "Dashboard_GeneralManager", selectedRecordId), {
        ...selectedRecord,
        status: "Pending GM Approval",
        isApproved: true,
        isGMApproved: null,
        cashAdvAmount: newAmount,
      });

      setFormSuccess("Cash advance request approved successfully.");
      setShowSaveConfirm(false); 
      setShowApproveAmount(false); 
    } catch (error) {
      console.error("Error approving cash advance:", error);
    }
  };

  // Handle final rejection after confirmation
  const handleRejectSubmit = async () => {
    if (!selectedRecordId || !rejectionReason.trim()) {
      setFormWarning("Please select a record and provide a rejection reason.");
      setTimeout(() => setFormWarning(''), 3000);
      return;
    }

    try {
      await updateDoc(doc(db, "Cash Advance", selectedRecordId), {
        status: "REJECTED",
        isApproved: false,
        rejectionReason: rejectionReason,
        isAttached: false,
      });

      setFormSuccess("Cash advance request rejected successfully.");
      setShowRejectConfirm(false); 
      setShowRejectReason(false); 
      setRejectionReason("");
      setRecords((prev) => prev.filter((r) => r.id !== selectedRecordId));
      setSelectedRecordId(null);
    } catch (error) {
      console.error("Rejection error:", error);
    }
  };

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
    { label: "Admin Dashboard", path: "/admin" },
  ];

  const handleRecordSelect = (recordId) => {
    setSelectedRecordId(recordId);
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    // Reset form state and inputs
    setValue("liquidationId", record.liquidationId || "");
    setValue("cashAdvAmount", record.cashAdvAmount || "");
    setValue("cashAdvanceId", record.cashAdvanceId || "");
    setValue("accountName", record.accountName || "");
    setShowApproveAmount(false);
    setShowRejectReason(false);
    setRejectionReason("");
  };

  const filteredRecords = sortedRecords.filter((record) =>
    (record.isApproved === null || record.isApproved === undefined) &&
    (record.accountName?.toLowerCase().includes(searchText.toLowerCase()) ||
      record.cashAdvanceId?.toString().includes(searchText))
  );

  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const uniqueCashIds = [...new Set(filteredRecords.map(r => r.cashAdvanceId).filter(Boolean))];
  
  // New validation checks for button disabling
  const isApprovedAmountValid = approvedAmount && approvedAmount > 0;
  const isRejectionReasonValid = rejectionReason.trim().length > 0;

  return (
    <div>
      <Navbar />
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <Breadcrumbs links={breadcrumbsLinks} />
        <div className="bg-[#1e293b] text-white px-6 py-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold">Cash Advance Amount Records (Admin)</h1>
          <p className="text-gray-300 mt-2">Select a cash advance request to approve or reject.</p>
        </div>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="flex-1 p-7">
            <InlineNotification type="error" message={formError} onDismiss={() => setFormError('')} />
            <InlineNotification type="success" message={formSuccess} onDismiss={() => setFormSuccess('')} />
            <InlineNotification type="info" message={formInfo} onDismiss={() => setFormInfo('')} />
            <InlineNotification type="warning" message={formWarning} onDismiss={() => setFormWarning('')} />

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex flex-col min-w-[200px] max-w-[200px]">
                <label className="font-semibold mb-1">Cash Advance ID</label>
                <select
                  className="p-2 border border-gray-300 rounded-md bg-gray-50 w-full focus:outline-none focus:border-[#263146] focus:bg-white"
                  {...register("cashAdvanceId")}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const rec = records.find(
                      (r) => String(r.cashAdvanceId) === String(selectedId)
                    );
                    handleRecordSelect(rec ? rec.id : null);
                  }}
                  value={
                    records.find((r) => r.id === selectedRecordId)?.cashAdvanceId || ""
                  }
                >
                  <option value="">Select ID</option>
                  {uniqueCashIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col min-w-[200px]">
                <label className="font-semibold mb-1">Account Name</label>
                <input
                  className="p-2 border border-gray-300 rounded-md bg-gray-50 w-full"
                  value={
                    records.find((r) => r.id === selectedRecordId)?.accountName || ""
                  }
                  disabled
                  placeholder="Account Name"
                />
              </div>
            </div>

            {selectedRecordId && (
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveAmount(true);
                      setShowRejectReason(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-md hover:bg-emerald-800 hover:text-emerald-100 transition"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectReason(true);
                      setShowApproveAmount(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2 bg-red-100 text-[#ab3437] font-semibold rounded-md hover:bg-[#ab3437] hover:text-red-100 transition"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>

                {showApproveAmount && (
                  <div className="flex flex-col gap-2 max-w-md">
                    <label className="font-semibold">Enter Approved Amount</label>
                    <input
                      type="number"
                      {...register("cashAdvAmount")}
                      className="p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:border-emerald-500 focus:bg-white"
                      placeholder="Enter amount..."
                    />
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={handleSaveApprovedAmountClick}
                        disabled={!isApprovedAmountValid}
                        className={`px-4 py-2 text-white rounded-md transition ${isApprovedAmountValid ? 'bg-emerald-600 hover:bg-emerald-800' : 'bg-gray-400 cursor-not-allowed'}`}
                      >
                        Save Approved Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowApproveAmount(false);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showRejectReason && (
                  <div className="flex flex-col gap-2 max-w-md">
                    <label className="font-semibold text-red-600">Reason for Rejection</label>
                    <textarea
                      id="rejectionReason"
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                      rows={3}
                    />
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectConfirm(true)}
                        disabled={!isRejectionReasonValid}
                        className={`px-4 py-2 text-white rounded-md transition ${isRejectionReasonValid ? 'bg-red-600 hover:bg-red-800' : 'bg-gray-400 cursor-not-allowed'}`}
                      >
                        Submit Rejection
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectReason(false);
                          setRejectionReason("");
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search & Pagination */}
            <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mt-6">
              <div className="flex items-center w-full md:w-[66%] px-3 py-2 border border-gray-300 rounded-md bg-white">
                <Search size={18} className="text-gray-500 mr-2" />
                <input
                  id="searchInput"
                  type="text"
                  className="w-full focus:outline-none"
                  placeholder="Search by Cash Advance ID or Account Name..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>


              <div className="flex items-center gap-3 text-sm font-medium flex-wrap">
                <button
                  className="px-3 py-2 bg-[#1e293b] text-white rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} className="inline align-middle" />
                </button>

                <span className="text-sm px-3 text-gray-700">
                  Page <strong>{currentPage}</strong> of {totalPages} |{" "}
                  {filteredRecords.length} results
                </span>

                <button
                  className="px-3 py-2 bg-[#1e293b] text-white rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} className="inline align-middle" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto mt-6">
              <div className="min-w-full">
                <table className="table-fixed w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-gray-100 text-sm font-semibold text-gray-700 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Cash Advance ID</th>
                      <th className="p-4 font-semibold">Account Name</th>
                      <th className="p-4 font-semibold">Activity</th>
                      {/* <th className="p-4 font-semibold">Amount ($)</th> */}
                      {/* <th className="p-4 font-semibold">Status</th> */}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredRecords.length > 0 ? (
                      paginatedRecords.map((record) => (
                        <tr
                          key={record.id}
                          className={`cursor-pointer transition ${selectedRecordId === record.id ? "bg-indigo-50 font-bold" : ""}`}
                          onClick={() => handleRecordSelect(record.id)}
                        >
                          <td className="p-4 break-words">{record.cashAdvanceId}</td>
                          <td className="p-4 break-words">{record.accountName}</td>
                          <td className="p-4 break-words">{record.activity}</td>
                          {/* <td className="p-4 break-words">{record.cashAdvAmount}</td> */}
                          {/* <td className="p-4 break-words">
                            {record.isApproved === true && "Approved"}
                            {record.isApproved === false && "Rejected"}
                            {(record.isApproved === null || record.isApproved === undefined) && "Pending"}
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5">
                            <FileX className="w-10 h-10 text-gray-400 mb-1" />
                            <h3 className="text-base font-semibold text-gray-700">No Records Found</h3>
                            <p className="text-sm text-gray-500">There are currently no cash advance requests to display.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Approval */}
      <Modal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Confirm Approval"
        footer={
          <>
            <button
              onClick={handleConfirmSaveApprovedAmount}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-800 transition"
            >
              Yes, Approve
            </button>
            <button
              onClick={() => setShowSaveConfirm(false)}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </>
        }
      >
        <p>Are you sure you want to approve this record? This action cannot be undone.</p>
        <label className="block mt-3 font-semibold">Cash Advance ID</label>
        <input
          type="text"
          value={watch("cashAdvanceId")}
          readOnly
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
        <label className="block mt-3 font-semibold">Approved Amount</label>
        <input
          type="number"
          value={approvedAmount}
          readOnly
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
      </Modal>

      {/* Confirmation Modal for Rejection */}
      <Modal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        title="Final Confirmation of Rejection"
        footer={
          <>
            <button
              onClick={handleRejectSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800 transition"
            >
              Yes, Reject
            </button>
            <button
              onClick={() => setShowRejectConfirm(false)}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </>
        }
      >
        <p>Are you sure you want to reject this record? This action cannot be undone.
        <label className="block mt-3 font-semibold">Cash Advance ID</label>
        <input
          type="text"
          value={watch("cashAdvanceId")}
          readOnly
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
        </p>
        <label className="block mt-4 font-semibold">Reason for Rejection</label>
        <textarea
          value={rejectionReason}
          readOnly
          className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default Dashboard_Admin;