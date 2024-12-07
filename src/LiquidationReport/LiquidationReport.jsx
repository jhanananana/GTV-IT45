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
      date: date
    };

    try {
      await setDoc(doc(db, "Liquidation", `Liquidation #${liquidationID}`), docData);
      alert("Liquidation report submitted successfully!");

      setAvailableCashAdvances(prev => prev.filter(ca => ca.id !== cashAdvanceId));

      const cashAdvanceRef = doc(db, "Cash Advance", cashAdvanceId);
      await updateDoc(cashAdvanceRef, { isAttached: true, isApproved: true });

      setLiquidationID(prevID => prevID + 1);
      reset();
      setCashAdvanceId(null);
      setFile(null);
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

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Liquidation Report", path: "/liquidationreport" },
  ];

  return (
    <>
      <Navbar />
      <Breadcrumbs links={breadcrumbsLinks} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-container">
          <div className="form-left">
            <h1 style={{ textAlign: 'right' }}>Liquidation Report</h1>

            {/* LIQUIDATION ID FIELD */}
            <div className="form-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input disabled value={liquidationID} className="cashAdvInput" id="liquidationId" type="text" readOnly />
            </div>

            {/* FIRST NAME */}
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                className="cashAdvInput"
                id="firstName"
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                placeholder="First Name"
              />
              {errors.firstName && <span className="error">{errors.firstName.message}</span>}
            </div>

            {/* LAST NAME */}
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                className="cashAdvInput"
                id="lastName"
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                placeholder="Last Name"
              />
              {errors.lastName && <span className="error">{errors.lastName.message}</span>}
            </div>

            {/* ACCOUNT NAME */}
            <div className="form-group">
              <label htmlFor="accountName">Account Name</label>
              <input
                placeholder="Account name of the request is displayed here.."
                disabled className="cashAdvInput" id="accountName" type="text" readOnly />
            </div>

            {/* ACTIVITY */}
            <div className="form-group">
              <label htmlFor="activity">Activity:</label>
              <textarea
                disabled
                className="cashAdvInput"
                id="activity"
                {...register('activity')}
                placeholder="Activity of the request is displayed here.."
                rows="3"
                readOnly
              />
              {errors.activity && <span className="error">{errors.activity.message}</span>}
            </div>

            {/* DATE FIELD */}
            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                className="cashAdvInput"
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* CASH ADVANCE */}
            <div className="form-group">
              <label htmlFor="cashAdvanceId">Cash Advance:</label>
              <select
                style={{width: '350px'}}
                className="cashAdvInput"
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
          <div className="form-right">
            <label>Upload a photo of receipt</label>
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Uploaded Receipt" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <p>Drag and drop file here</p>
              )}
            </div>
            <button type="button" className="btnRemove" onClick={() => setFile(null)}>Remove File</button>

            {/* CASH AMOUNT */}
            <div className="form-group">
              <label htmlFor="cashAdvAmount">Cash Advance Amount:</label>
              <input
                disabled
                className="cashAdvInput"
                id="cashAdvAmount"
                type="number"
                value={cashAdvAmount}
                readOnly
              />
            </div>

            {/* TOTAL AMOUNT SPENT */}
            <div className="form-group">
              <label htmlFor="totalAmountSpent">Total Amount Spent:</label>
              <input
                className="cashAdvInput"
                id="totalAmountSpent"
                type="number"
                {...register('totalAmountSpent', { required: 'This field is required' })}
                placeholder="Total Amount Spent"
              />
              {errors.totalAmountSpent && <span className="error">{errors.totalAmountSpent.message}</span>}
            </div>

            {/* EXCESS / FOR REFUND */}
            <div className="form-group">
              <label htmlFor="excessRefund">Excess Refund:</label>
              <input
                className="cashAdvInput"
                id="excessRefund"
                type="number"
                value={excessRefund || 0}
                readOnly
              />
            </div>
            <button type="submit" className="btnSubmit">Submit Report</button>
          </div>
        </div>
      </form>
      <Footer />
    </>
  );
};

export default LiquidationReport;
