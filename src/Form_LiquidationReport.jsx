import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import Navbar from './NavBarAndFooter/navbar.jsx';
import Footer from './NavBarAndFooter/footer.jsx';
import { setDoc, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import db from "./firebase.js";
import Breadcrumbs from './Breadcrumbs/Breadcrumbs.jsx';

const LiquidationReport = () => {
  const [liquidationID, setLiquidationID] = useState(null);
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
  const [availableCashAdvances, setAvailableCashAdvances] = useState([]);
  const [file, setFile] = useState(null);
  const [excessRefund, setExcessRefund] = useState(0);
  const [cashAdvAmount, setCashAdvAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [totalAmountSpent, setTotalAmountSpent] = useState(0); // Track Total Amount Spent

  useEffect(() => {
    const fetchAvailableCashAdvances = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Cash Advance"));
        const available = querySnapshot.docs
          .filter(doc => doc.data().status === "OPEN (GM Approved)" && doc.data().isApproved && !doc.data().isAttached)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableCashAdvances(available);
      } catch (error) {
        console.error("Error fetching cash advances: ", error);
      }
    };
    fetchAvailableCashAdvances();

    const fetchLastLiquidationID = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Liquidation"));
        const docs = querySnapshot.docs;

        if (docs.length > 0) {
          const lastDocID = Math.max(
            ...docs.map((doc) => {
              const match = doc.id.match(/(\d+)$/); // Match numbers at the end of the ID
              return match ? parseInt(match[1], 10) : 0;
            })
          );
          setLiquidationID(lastDocID + 1); // Set the next ID
        } else {
          setLiquidationID(1000); // Start from 1000 if no records
        }
      } catch (error) {
        console.error("Error fetching last liquidation ID: ", error);
      }
    };
    fetchLastLiquidationID();
  }, []);

  // File upload handling
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB!");
    } else if (file && file.type.startsWith("image/")) {
      setFile(file);
    } else {
      alert("Only image files are allowed!");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' });

  // Handle form submission
  const onSubmit = async (data) => {
    if (!cashAdvanceId) {
      alert("Please select an OPEN Cash Advance Request to continue.");
      return;
    }

    if (!file) {
      alert("Uploading a receipt is mandatory. Please upload a receipt to proceed.");
      return;
    }

    const selectedCashAdvance = availableCashAdvances.find(ca => ca.id === cashAdvanceId);
    const cashAdvAmount = selectedCashAdvance.cashAdvAmount || 0;
    const activity = selectedCashAdvance.activity || "N/A";
    const accountName = selectedCashAdvance.accountName || "N/A";

    const docData = {
      ...data,
      cashAdvanceId,
      accountName,
      activity,
      cashAdvAmount,
      liquidationID: liquidationID || 'N/A',
      isAttached: true,
      isApproved: true,
      date: date,
      excessRefund,
      totalAmountSpent,
      receipt: file.name, // Save the file name or handle the file upload in storage
    };

    try {
      // Save the file to Firebase Storage if needed here (not included in this code)

      await setDoc(doc(db, "Liquidation", `Liquidation #${liquidationID}`), docData);
      alert("Liquidation report submitted successfully!");

      setAvailableCashAdvances(prev => prev.filter(ca => ca.id !== cashAdvanceId));

      const cashAdvanceRef = doc(db, "Cash Advance", cashAdvanceId);
      await updateDoc(cashAdvanceRef, { isAttached: true, isApproved: true });

      setLiquidationID(prevID => prevID + 1);
      reset(); // Reset the form inputs
      setCashAdvanceId(null); // Clear selected Cash Advance
      setFile(null); // Clear the uploaded file

      // Reset Cash Advance Amount, Total Amount Spent, and Excess Refund
      setCashAdvAmount(0);
      setTotalAmountSpent(0);
      setExcessRefund(0);
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Failed to submit. Please try again.");
    }
  };

  useEffect(() => {
    const selectedCashAdvance = availableCashAdvances.find(ca => ca.id === cashAdvanceId);
    if (selectedCashAdvance) {
      document.getElementById('accountName').value = selectedCashAdvance.accountName;
      document.getElementById('activity').value = selectedCashAdvance.activity;
      document.getElementById('cashAdvAmount').value = selectedCashAdvance.cashAdvAmount;
      setCashAdvAmount(selectedCashAdvance.amount);

      const totalSpent = parseFloat(document.getElementById('totalAmountSpent')?.value || 0);
      const refund = selectedCashAdvance.amount - totalSpent;
      setExcessRefund(refund >= 0 ? refund : 0);
    }
  }, [cashAdvanceId, availableCashAdvances]);

  useEffect(() => {
    if (cashAdvAmount > 0) {
      const refund = cashAdvAmount - totalAmountSpent;
      setExcessRefund(refund >= 0 ? refund : 0); // Ensure no negative values
    } else {
      setExcessRefund(0); // Default if no cashAdvanceAmount
    }
  }, [cashAdvAmount, totalAmountSpent]);

  useEffect(() => {
    const selectedCashAdvance = availableCashAdvances.find(ca => ca.id === cashAdvanceId);
    if (selectedCashAdvance) {
      setCashAdvAmount(selectedCashAdvance.cashAdvAmount || 0); // Use cashAdvAmount
    }
  }, [cashAdvanceId, availableCashAdvances]);

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Liquidation Report", path: "/liquidationreport" },
  ];

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <Breadcrumbs links={breadcrumbsLinks} />
        <div className="bg-[#1e293b] text-white px-6 py-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold">Liquidation Report</h1>
          <p className="text-gray-300 mt-2">Under construction.</p>

        </div>

        <div className="bg-white shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="grid bg-white grid-cols-1 p-10 md:grid-cols-2 gap-10">

              <div className="space-y-5">
                <div className="text-xl font-medium text-gray-700 mb-4">
                  <h3>Report Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="liquidationId" className="block text-sm font-medium text-gray-700">Liquidation ID</label>
                    <input
                      disabled
                      value={liquidationID}
                      id="liquidationId"
                      type="text"
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="cashAdvanceId" className="block text-sm font-medium text-gray-700">Select Cash Advance ID</label>
                    <select
                      id="cashAdvanceId"
                      value={cashAdvanceId || ""}
                      onChange={(e) => setCashAdvanceId(e.target.value)}
                      disabled={!availableCashAdvances.length}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                    >
                      <option value="" disabled>
                        {availableCashAdvances.length ? 'Select a Cash Advance' : 'No Cash Advances Available'}
                      </option>
                      {availableCashAdvances.map(cashAdvance => (
                        <option key={cashAdvance.id} value={cashAdvance.id}>
                          {cashAdvance.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
                    <input
                      placeholder="Account name of the request"
                      disabled
                      id="accountName"
                      type="text"
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Activity</label>
                    <textarea
                      id="activity"
                      {...register('activity')}
                      placeholder="Activity of the request"
                      rows="3"
                      disabled
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                    {errors.activity && <span className="text-red-600 text-sm">{errors.activity.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      disabled
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-4">Upload Photo of Receipt</h3>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <img src={URL.createObjectURL(file)} alt="Uploaded Receipt" className="max-w-full max-h-60 object-contain mx-auto" />
                    ) : (
                      <p className="text-gray-500">Drag/drop the file here</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-600 hover:underline"
                    onClick={() => setFile(null)}
                  >
                    Remove File
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="cashAdvAmount" className="block text-sm font-medium text-gray-700">Cash Advance Amount</label>
                    <input
                      disabled
                      id="cashAdvAmount"
                      type="number"
                      value={cashAdvAmount}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="totalAmountSpent" className="block text-sm font-medium text-gray-700">Total Amount Spent</label>
                    <input
                      id="totalAmountSpent"
                      type="number"
                      value={totalAmountSpent}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTotalAmountSpent(value);
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                          const selectedCashAdvance = availableCashAdvances.find(ca => ca.id === cashAdvanceId);
                          if (selectedCashAdvance) {
                            const refund = selectedCashAdvance.amount - numericValue;
                            setExcessRefund(refund >= 0 ? refund : 0);
                          }
                        }
                      }}
                      placeholder="Total Amount Spent"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.totalAmountSpent && <span className="text-red-600 text-sm">{errors.totalAmountSpent.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="excessRefund" className="block text-sm font-medium text-gray-700">Excess/Refund</label>
                    <input
                      id="excessRefund"
                      type="number"
                      value={excessRefund || 0}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>
              </div>


              {/* Submit Button */}
              <div className="mt-8 border-t pt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1e293b] text-white rounded-md hover:bg-[#080b0f] transition"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LiquidationReport;
