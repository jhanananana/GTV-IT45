import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "./firebase.js";
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';
import { CheckCircle, XCircle, FileX, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard_Admin = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const [showApproveAmount, setShowApproveAmount] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <Breadcrumbs links={breadcrumbsLinks} />
        <div className="bg-[#1e293b] text-white px-6 py-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold">Cash Advance Amount Records (Admin)</h1>
          <p className="text-gray-300 mt-2">Select a cash advance request to approve or reject.</p>
        </div>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="flex-1 p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex flex-col min-w-[200px] max-w-[200px]">
                  <label className="font-semibold mb-1">Cash Advance ID</label>
                  <select
                    className="p-2 border border-gray-300 rounded-md bg-gray-50 w-full focus:outline-none focus:border-[#263146] focus:bg-white"
                    {...register("cashAdvanceId")}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setValue("cashAdvanceId", selectedId);
                      const rec = records.find(
                        (r) => String(r.cashAdvanceId) === String(selectedId)
                      );
                      setValue("accountName", rec ? rec.accountName : "");
                      setValue("cashAdvAmount", rec ? rec.cashAdvAmount : "");
                      setSelectedRecordId(rec ? rec.id : null);
                      // Reset form state
                      setShowApproveAmount(false);
                      setShowRejectReason(false);
                      setRejectionReason("");
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
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-800 transition"
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
                          onClick={() => {
                            if (!rejectionReason.trim()) return alert("Please provide a reason for rejection.");
                            handleRejectSubmit(rejectionReason);
                            setShowRejectReason(false);
                            setRejectionReason("");
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition"
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
            </form>

            {/* Search & Pagination */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
              <div className="flex items-center w-full md:w-[350px] px-3 py-2 border border-gray-300 rounded-md bg-white">
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
                      <th className="p-4 font-semibold">Amount ($)</th>
                      <th className="p-4 font-semibold">Status</th>
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
                          <td className="p-4 break-words">{record.cashAdvAmount}</td>
                          <td className="p-4 break-words">{record.cashAdvAmount}</td>

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
    </div>
  );
};

export default Dashboard_Admin;
