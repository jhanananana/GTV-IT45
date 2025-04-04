import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import './LiquidationReport.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Footer from '../NavBarAndFooter/footer.jsx';
import { setDoc, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import db from "../firebase";
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

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
      <div className="gtv_full-container">
        <Breadcrumbs links={breadcrumbsLinks} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="gtv_form-container">
            <div className="gtv_form-left">
              <h1 style={{ textAlign: 'left' }}>Liquidation Report</h1>
              
              <br></br>

              {/* LIQUIDATION ID FIELD */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="liquidationId">Liquidation ID:</label>
                <input disabled value={liquidationID} className="gtv_cashAdvInput" id="liquidationId" type="text" readOnly />
              </div>

              {/* FIRST NAME */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="firstName">First Name:</label>
                <input
                  className="gtv_cashAdvInput"
                  id="firstName"
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="First Name"
                />
                {errors.firstName && <span className="error">{errors.firstName.message}</span>}
              </div>

              {/* LAST NAME */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="lastName">Last Name:</label>
                <input
                  className="gtv_cashAdvInput"
                  id="lastName"
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Last Name"
                />
                {errors.lastName && <span className="error">{errors.lastName.message}</span>}
              </div>

              {/* ACCOUNT NAME */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="accountName">Account Name</label>
                <input
                  placeholder="Account name of the request is displayed here.."
                  disabled className="gtv_cashAdvInput" id="accountName" type="text" readOnly />
              </div>

              {/* ACTIVITY */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="activity">Activity:</label>
                <textarea
                  disabled
                  className="gtv_cashAdvInput"
                  id="activity"
                  {...register('activity')}
                  placeholder="Activity of the request is displayed here.."
                  rows="3"
                  readOnly
                />
                {errors.activity && <span className="error">{errors.activity.message}</span>}
              </div>

              {/* DATE FIELD */}
              <div className="gtv_form-group">
                <label htmlFor="date">Date:</label>
                <input
                  className="gtv_cashAdvInput"
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* CASH ADVANCE */}
              <div className="gtv_form-group">
                <label htmlFor="cashAdvanceId">Cash Advance:</label>
                <select
                  style={{ width: '350px' }}
                  className="gtv_cashAdvInput"
                  id="cashAdvanceId"
                  value={cashAdvanceId || ""}
                  onChange={(e) => setCashAdvanceId(e.target.value)}
                  disabled={!availableCashAdvances.length}
                >
                  <option value="" disabled>
                    {availableCashAdvances.length ? 'Select a Cash Advance' : 'No Cash Advances Available'}
                  </option>
                  {availableCashAdvances.map(cashAdvance => (
                    <option key={cashAdvance.id} value={cashAdvance.id}>
                      {`ID: ${cashAdvance.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RECEIPT UPLOAD */}
            <div className="gtv_form-right">
              <label className="gtv_label">Upload a photo of receipt</label>
              <div {...getRootProps()} className="gtv_dropzone">
                <input {...getInputProps()} />
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="Uploaded Receipt" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <p>Drag and drop file here</p>
                )}
              </div>
              <button type="button" className="gtv_buttonLF gtv_btnRemove" onClick={() => setFile(null)}>Remove File</button>

              {/* CASH AMOUNT */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="cashAdvAmount">Cash Advance Amount:</label>
                <input
                  disabled
                  className="gtv_cashAdvInput"
                  id="cashAdvAmount"
                  type="number"
                  value={cashAdvAmount}
                  readOnly
                />
              </div>

              {/* TOTAL AMOUNT SPENT */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="totalAmountSpent">Total Amount Spent:</label>
                <input
                  className="gtv_cashAdvInput"
                  id="totalAmountSpent"
                  type="number"
                  value={totalAmountSpent}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow the input to be a string while typing
                    setTotalAmountSpent(value);

                    // Calculate excess refund only when the input is a valid number
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
                />
                {errors.totalAmountSpent && <span className="error">{errors.totalAmountSpent.message}</span>}
              </div>

              {/* EXCESS / FOR REFUND */}
              <div className="gtv_form-group">
                <label className="gtv_label" htmlFor="excessRefund">Excess Refund:</label>
                <input
                  className="gtv_cashAdvInput"
                  id="excessRefund"
                  type="number"
                  value={excessRefund || 0}
                  readOnly
                />
              </div>
              <button type="submit" className="gtv_buttonLF gtv_btnSubmit">Submit Report</button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LiquidationReport;
