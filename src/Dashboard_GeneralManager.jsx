import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "./firebase.js";
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';
import { CheckCircle, XCircle, AlertCircle, X, AlertTriangle, Info, FileX } from 'lucide-react';
import Modal from './Modal.jsx';

const SearchBox = ({ placeholder, value, onChange }) => (
    <div className="flex items-center w-full md:w-[60%] px-3 py-2 border border-gray-300 rounded-md bg-white">
        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
            type="text"
            className="bg-transparent outline-none w-full"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

const Dashboard_GeneralManager = () => {
    const { register, setValue } = useForm();
    const navigate = useNavigate();

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formInfo, setFormInfo] = useState('');
    const [formWarning, setFormWarning] = useState('');

    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

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
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const filteredRecords = fetchedRecords.filter(
                record => record.isApproved === true && record.isGMApproved === null
            );
            setRecords(filteredRecords);
        });

        return () => unsubscribe();
    }, []);

    const handleConfirmApprove = async () => {
        if (!selectedRecord) return;
        try {
            const recordDocRef = doc(db, "Cash Advance", selectedRecord.id);
            await updateDoc(recordDocRef, {
                status: "OPEN (GM Approved)",
                isGMApproved: true,
                isAttached: false,
            });

            setFormSuccess("Cash advance request approved successfully.");
            setShowApprovalModal(false);
            setSelectedRecord(null);
        } catch (error) {
            console.error("Error approving record:", error);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedRecord || rejectionReason.trim() === "") {
            return;
        }
        try {
            const recordDocRef = doc(db, "Cash Advance", selectedRecord.id);
            await updateDoc(recordDocRef, {
                status: "CLOSED (GM Rejected)",
                isGMApproved: false,
                rejectionReason: rejectionReason,
                isAttached: false,
            });

            setFormSuccess("Cash advance request rejected successfully.");
            setShowRejectModal(false);
            setSelectedRecord(null);
            setRejectionReason("");
        } catch (error) {
            console.error("Error rejecting record:", error);
        }
    };


    const filteredRecords = records.filter((record) => {
        const lowerSearch = searchText.toLowerCase();

        const accountNameMatch = (record.accountName || "").toLowerCase().includes(lowerSearch);
        const cashAdvanceIdMatch = record.cashAdvanceId?.toString().toLowerCase().includes(lowerSearch);
        const amountMatch = record.cashAdvAmount !== undefined && record.cashAdvAmount !== null
            ? record.cashAdvAmount.toString().toLowerCase().includes(lowerSearch)
            : false;

        return accountNameMatch || cashAdvanceIdMatch || amountMatch;
    });

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRecordSelect = (record) => {
        setSelectedRecord(record);
        setValue("cashAdvAmount", record.cashAdvAmount || "");
        setValue("cashAdvanceId", record.cashAdvanceId || "");
        setValue("accountName", record.accountName || "");
        setRejectionReason(""); // Reset rejection reason on new selection
    };

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Liquidation Report", path: "/liquidationreport" },
        { label: "Admin Dashboard", path: "/admin" },
        { label: "General Manager Dashboard", path: "/generalmanager" },
    ];

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
                <Breadcrumbs links={breadcrumbsLinks} />

                <div className="bg-[#1e293b] text-white p-6 rounded-t-2xl">
                    <h1 className="text-2xl font-bold">Cash Advance Amount Records (General Manager)</h1>
                    <p className="text-gray-300 mt-2">Select a cash advance request to approve or reject.</p>
                </div>

                <div className="bg-white rounded-b-lg shadow p-6 flex flex-col">
                    <InlineNotification type="error" message={formError} onDismiss={() => setFormError('')} />
                    <InlineNotification type="success" message={formSuccess} onDismiss={() => setFormSuccess('')} />
                    <InlineNotification type="info" message={formInfo} onDismiss={() => setFormInfo('')} />
                    <InlineNotification type="warning" message={formWarning} onDismiss={() => setFormWarning('')} />

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Form Section */}
                        <div className="flex-1">
                            <form className="py-2">
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex-1">
                                            <label className="block font-semibold mb-1 text-gray-700">Cash Advance ID</label>
                                            <input
                                                disabled
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                                                // {...register("cashAdvanceId")} is from a library like react-hook-form
                                                // For this example, we'll provide a placeholder value
                                                {...register("cashAdvanceId")}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="block font-semibold mb-1 text-gray-700">Account Name</label>
                                            <input
                                                disabled
                                                readOnly
                                                className="disabled w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                                                // {...register("accountName")}
                                                {...register("accountName")}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="block font-semibold mb-1 text-gray-700">Cash Advance Amount</label>
                                            <input
                                                disabled
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                                                // {...register("cashAdvAmount")}
                                                {...register("cashAdvAmount")}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => selectedRecord && setShowApprovalModal(true)}
                                            className="flex items-center gap-2 px-5 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-md hover:bg-emerald-800 hover:text-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!selectedRecord}
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => selectedRecord && setShowRejectModal(true)}
                                            className="flex items-center gap-2 px-5 py-2 bg-red-100 text-[#ab3437] font-semibold rounded-md hover:bg-[#ab3437] hover:text-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!selectedRecord}
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center my-7 gap-4">
                        <SearchBox
                            className=""
                            placeholder="Search by ID, Name, or Amount..."
                            value={searchText}
                            onChange={val => {
                                setSearchText(val);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 bg-[#263146] text-white rounded disabled:opacity-50 transition"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            <span className="text-sm text-gray-700">
                                Page <strong>{currentPage}</strong> of {totalPages} | {filteredRecords.length} results
                            </span>
                            <button
                                className="px-3 py-1 bg-[#263146] text-white rounded disabled:opacity-50 transition"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto text-sm border-collapse">
                            <thead className="bg-gray-100 text-sm font-semibold text-gray-700 border-b">
                                <tr>
                                    <td className="p-4 text-left">Cash Advance ID</td>
                                    <td className="p-4 text-left">Account Name</td>
                                    <td className="p-4 text-left">Amount ($)</td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedRecords.length > 0 ? (
                                    paginatedRecords.map((record) => (
                                        <tr
                                            key={record.id}
                                            className={`cursor-pointer transition-colors hover:bg-indigo-50 ${selectedRecord?.id === record.id ? "bg-indigo-50 font-bold" : ""}`}
                                            onClick={() => handleRecordSelect(record)}
                                        >
                                            <td className="p-4 break-words">{record.cashAdvanceId}</td>
                                            <td className="p-4 break-words">{record.accountName}</td>
                                            <td className="p-4 break-words">${record.cashAdvAmount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-6 text-center text-gray-500">
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

            <Modal
                isOpen={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                title="Confirm Approval"
                footer={
                    <>
                        <button
                            onClick={handleConfirmApprove}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-800 transition shadow-sm"
                        >
                            Yes, Approve
                        </button>
                        <button
                            onClick={() => setShowApprovalModal(false)}
                            className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition shadow-sm"
                        >
                            Cancel
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to approve this record? This action cannot be undone.</p>
                <label className="block mt-3 font-semibold text-gray-700">Cash Advance ID</label>
                <input
                    type="text"
                    value={selectedRecord?.cashAdvanceId || ""}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <label className="block mt-3 font-semibold text-gray-700">Cash Advance Amount</label>
                <input
                    type="text"
                    value={selectedRecord?.cashAdvAmount || ""}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                />
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Cash Advance"
                footer={
                    <>
                        <button
                            onClick={handleConfirmReject}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition shadow-sm"
                            disabled={rejectionReason.trim() === ""}
                        >
                            Yes, Reject
                        </button>
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition shadow-sm"
                        >
                            Cancel
                        </button>
                    </>
                }
            >
                <p>Please provide a reason for rejecting this cash advance request. This action cannot be undone.</p>
                <label className="block mt-3 font-semibold text-gray-700">Cash Advance ID</label>
                <input
                    type="text"
                    value={selectedRecord?.cashAdvanceId || ""}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <label className="block mt-4 font-semibold text-gray-700">Reason for Rejection</label>
                <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows={3}
                    placeholder="Enter reason here..."
                />
            </Modal>
        </div>
    );
};

export default Dashboard_GeneralManager;

