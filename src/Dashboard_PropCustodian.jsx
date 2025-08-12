import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import db from "./firebase.js";
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';
const SearchBox = ({ placeholder, value, onChange }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 "
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const Dashboard_PropCustodian = () => {
    const [records, setRecords] = useState([]);
    const [liquidationIds, setLiquidationIds] = useState({});
    const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredAndSearchedRecords = records.filter((record) => {
        const isStatusMatch = activeStatusFilter === "ALL" || record.status === activeStatusFilter;

        const searchTerms = (searchText || "").toLowerCase().split(/\s+/).filter(Boolean);
        if (searchTerms.length === 0) return isStatusMatch;

        const fields = [
            (record.accountName || "").toString().toLowerCase(),
            (record.cashAdvanceId || "").toString().toLowerCase(),
            (liquidationIds[record.cashAdvanceId] || "").toString().toLowerCase()
        ];

        const isSearchMatch = searchTerms.every(term =>
            fields.some(field => field.includes(term))
        );

        return isStatusMatch && isSearchMatch;
    });

    const totalPages = Math.ceil(filteredAndSearchedRecords.length / itemsPerPage);
    const paginatedRecords = filteredAndSearchedRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        const unsubscribeCashAdvance = onSnapshot(collection(db, "Cash Advance"), (snapshot) => {
            const fetchedRecords = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const updatedRecords = fetchedRecords.map(record => {
                let status = record.status || 'ALL';
                if (record.isApproved && record.isGMApproved && record.isAttached) {
                    status = "Closed (Approved)";
                } else if (record.isApproved && record.isGMApproved === true && !record.isAttached) {
                    status = "Open (GM Approved)";
                } else if (!record.isApproved && !record.isGMApproved) {
                    status = "Closed (GM Rejected)";
                } else if (record.isApproved && record.isAttached === false) {
                    status = "Closed (Rejected)";
                } else if (record.isApproved === null || record.isGMApproved === null) {
                    status = "Pending";
                }
                return { ...record, status };
            });
            setRecords(updatedRecords);
        });

        const unsubscribeLiquidation = onSnapshot(collection(db, "Liquidation"), (snapshot) => {
            const liquidationMap = {};
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const caId = data.cashAdvanceId;
                if (caId) {
                    liquidationMap[caId] = doc.id;
                }
            });
            setLiquidationIds(liquidationMap);
        });

        return () => {
            unsubscribeCashAdvance();
            unsubscribeLiquidation();
        };
    }, []);

    const getStatusClass = (status) => {
        switch (status.toUpperCase()) {
            case "CLOSED (APPROVED)":
                return "bg-green-100 text-green-700 rounded-md ml-2";
            case "CLOSED (GM REJECTED)":
            case "CLOSED (REJECTED)":
                return "bg-red-100 text-red-700 rounded-md ml-2";
            case "OPEN (GM APPROVED)":
                return "bg-yellow-100 text-yellow-600 rounded-md ml-2";
            case "PENDING":
                return "bg-gray-200 text-gray-700 rounded-md ml-2";
            default:
                return "";
        }
    };

    const statusLegends = [
        {
            key: "ALL",
            label: "All",
            bg: "bg-gray-600",
            text: "text-white",
            ring: "ring-gray-300",
            custom: "border border-gray-600",
        },
        {
            key: "OPEN (GM APPROVED)",
            label: "Open (GM Approved)",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
            ring: "ring-yellow-300",
            custom: "border border-yellow-200"
        },
        {
            key: "CLOSED (APPROVED)",
            label: "Closed (Approved)",
            bg: "bg-green-100",
            text: "text-green-700",
            ring: "ring-green-300",
            custom: "border border-green-200"
        },
        {
            key: "CLOSED (GM REJECTED)",
            label: "Closed (GM Rejected)",
            bg: "bg-red-100",
            text: "text-red-700",
            ring: "ring-red-300",
            custom: "border border-red-200"
        },
        {
            key: "CLOSED (REJECTED)",
            label: "Closed (Rejected)",
            bg: "bg-red-100",
            text: "text-red-700",
            ring: "ring-red-300",
            custom: "border border-red-200"
        },
        {
            key: "PENDING",
            label: "Pending",
            bg: "bg-gray-200",
            text: "text-gray-700",
            ring: "ring-gray-300",
            custom: "border border-gray-200"
        }
    ];

    const Legend = () => (
        <div className="flex flex-wrap justify-start gap-0 mb-4">
            {statusLegends.map((legend) => (
                <button
                    key={legend.key}
                    type="button"
                    onClick={() => setActiveStatusFilter(legend.key)}
                    className={`
                    px-[10px] py-[10px] rounded-[3px] mr-[15px] mb-2
                    text-[14px] font-medium
                    ${legend.bg} ${legend.text} ${legend.custom}
                    ${activeStatusFilter === legend.key ? `${legend.ring} ring-2` : ""}
                    transition
                `}
                >
                    {legend.label}
                </button>
            ))}
        </div>
    );

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Liquidation Report", path: "/liquidationreport" },
        { label: "Admin Dashboard", path: "/admin" },
        { label: "General Manager Dashboard", path: "/generalmanager" },
        { label: "Property Custodian Dashboard", path: "/propcustodian" },
    ];

    return (
        <div>
            <Navbar />
            <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
                <Breadcrumbs links={breadcrumbsLinks} />

                <div className="bg-slate-800 text-white px-6 py-6 rounded-t-2xl">
                    <h1 className="text-2xl font-bold">Cash Advance Status Dashboard</h1>
                </div>

                <div className="bg-white p-6 rounded-b-2xl shadow">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Request Status
                        </h3>
                        <Legend />
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div className="flex-1 min-w-[250px] max-w-[90%]">
                            <SearchBox
                                placeholder="Search by Account Name, Cash Advance ID, or Liquidation ID..."
                                value={searchText}
                                onChange={(val) => {
                                    setSearchText(val);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-2 bg-[#1e293b] text-white rounded disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            <span className="text-sm px-3 text-gray-700">
                                Page <strong>{currentPage}</strong> of {totalPages} | {filteredAndSearchedRecords.length} results
                            </span>
                            <button
                                className="px-3 py-2 bg-[#1e293b] text-white rounded disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-full border rounded-md overflow-hidden">
                            <div className="grid grid-cols-6 bg-gray-100 text-sm font-semibold text-gray-700 border-b">
                                <div className="px-4 py-2">Status</div>
                                <div className="px-4 py-2">Liquidation ID</div>
                                <div className="px-4 py-2">Cash Advance ID</div>
                                <div className="px-4 py-2">Account Name</div>
                                <div className="px-4 py-2">Amount ($)</div>
                                <div className="px-4 py-2">Rejection Reason</div>
                                {/* <div className="px-4 py-2">Date</div> */}
                            </div>
                            <div>
                                {paginatedRecords.length > 0 ? (
                                    paginatedRecords.map((record) => {
                                        const liquidationId = liquidationIds[record.cashAdvanceId] || "N/A";
                                        return (
                                            <div
                                                key={record.id}
                                                className="grid grid-cols-6 py-3 border-t text-sm text-gray-800 hover:bg-gray-50 cursor-pointer transition"
                                            >
                                                <div className={`px-4 py-2 font-medium ${getStatusClass(record.status)}`}>
                                                    {record.status}
                                                </div>
                                                <div className="px-4 py-2">{liquidationId}</div>
                                                <div className="px-4 py-2">{record.cashAdvanceId}</div>
                                                <div className="px-4 py-2"><b>{record.accountName}</b></div>
                                                <div className="px-4 py-2">${record.cashAdvAmount}</div>
                                                <div className="px-4 py-2">{record.rejectionReason || " "}</div>
                                                {/* <div className="px-4 py-2">N/A</div> */}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center px-4 py-6 text-gray-500">
                                        No records to display.
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

export default Dashboard_PropCustodian;