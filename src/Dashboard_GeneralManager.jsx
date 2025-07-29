import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import db from "./firebase.js";
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';
import { CheckCircle, XCircle, FileX } from 'lucide-react';

const SearchBox = ({ placeholder, value, onChange }) => (
    <div className="flex items-center border rounded px-2 py-1 bg-gray-50 w-full max-w-xs">
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

    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const handleApprove = async () => {
        if (!selectedRecord) {
            alert("No record selected. Please select a record to approve.");
            return;
        }

        try {
            await updateDoc(doc(db, "Cash Advance", selectedRecord.id), {
                status: "OPEN (GM Approved)",
                isGMApproved: true,
                isAttached: false,
            });

            alert("Record approved by GM!");

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
        { label: "Admin Dashboard", path: "/admin" },
        { label: "General Manager Dashboard", path: "/generalmanager" },
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Breadcrumbs links={breadcrumbsLinks} />

                <div className="bg-[#1e293b] text-white px-6 py-6 rounded-t-2xl">
                    <h1 className="text-2xl font-bold">Cash Advance Amount Records (Admin)</h1>
                    <p className="text-gray-300 mt-2">Select a cash advance request to approve or reject.</p>

                </div>

                <div className="bg-white rounded-b-lg shadow p-6 flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Form Section */}
                        <div className="flex-1">
                            <form>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-semibold mb-1">Cash Advance ID</label>
                                        <input
                                            disabled
                                            readOnly
                                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                            {...register("cashAdvanceId")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1">Account Name</label>
                                        <input
                                            disabled
                                            readOnly
                                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                            {...register("accountName")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1">Cash Advance Amount</label>
                                        <input
                                            disabled
                                            readOnly
                                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                            {...register("cashAdvAmount")}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRejectPopupOpen(true)}
                                            className="flex items-center gap-2 px-5 py-2 bg-red-100 text-[#ab3437] font-semibold rounded-md hover:bg-[#ab3437] hover:text-red-100 transition"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            className="flex items-center gap-2 px-5 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-md hover:bg-emerald-800 hover:text-emerald-100 transition"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <SearchBox
                            placeholder="Search by Cash Advance ID, Account Name, or Amount..."
                            value={searchText}
                            onChange={val => {
                                setSearchText(val);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 bg-[#263146] text-white rounded disabled:opacity-50"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            <span className="text-sm text-gray-700">
                                Page <strong>{currentPage}</strong> of {totalPages} | {filteredRecords.length} results
                            </span>
                            <button
                                className="px-3 py-1 bg-[#263146] text-white rounded disabled:opacity-50"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed text-sm border-collapse">
                            <thead className="bg-gray-100 text-sm font-semibold text-gray-700 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-left">Cash Advance ID</th>
                                    <th className="p-4 font-semibold text-left">Account Name</th>
                                    <th className="p-4 font-semibold text-left">Cash Advance Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedRecords.length > 0 ? (
                                    paginatedRecords.map((record) => (
                                        <tr
                                            key={record.id}
                                            className={`cursor-pointer transition ${selectedRecord === record.id ? "bg-indigo-50 font-bold" : ""}`}
                                            onClick={() => handleRecordSelect(record.id)}
                                        >
                                            <td className="p-4 break-words">{record.cashAdvanceId}</td>
                                            <td className="p-4 break-words">{record.accountName}</td>
                                            <td className="p-4 break-words">{record.cashAdvAmount}</td>
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

            {isRejectPopupOpen && selectedRecord && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    onClick={() => setIsRejectPopupOpen(false)}
                >
                    <div
                        className="bg-white p-6 rounded-md shadow-lg w-[95%] max-w-[500px]"
                        onClick={(e) => e.stopPropagation()}
                    >
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

export default Dashboard_GeneralManager;
