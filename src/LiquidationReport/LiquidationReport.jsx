import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import CashAdvance from '../CashAdvance/CashAdvance.jsx';
import './LiquidationReport.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import { setDoc, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import db from "../firebase";
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const LiquidationReport = () => {
  const [liquidationID, setLiquidationID] = useState(null);
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
  const [availableCashAdvances, setAvailableCashAdvances] = useState([]);
  const [file, setFile] = useState(null);
  const [isCashAdvanceOpen, setIsCashAdvanceOpen] = useState(false);
  const [excessRefund, setExcessRefund] = useState(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch available cash advances on mount
  useEffect(() => {
    const fetchAvailableCashAdvances = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Cash Advance"));
        const available = querySnapshot.docs
          .filter(doc => !doc.data().isAttached)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableCashAdvances(available);
      } catch (error) {
        console.error("Error fetching cash advances: ", error);
      }
    };
    fetchAvailableCashAdvances();
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
      alert("Please select a Cash Advance.");
      return;
    }

    const docData = {
      ...data,
      cashAdvanceId,
      liquidationID,
      isAttached: true,
      date: new Date(),
    };

    try {
      await setDoc(doc(collection(db, "Liquidation")), docData);

      // Update the selected cash advance
      const cashAdvanceRef = doc(db, "Cash Advance", cashAdvanceId);
      await updateDoc(cashAdvanceRef, { isAttached: true });

      alert("Liquidation report submitted successfully!");
      reset();
      setCashAdvanceId(null);
      setFile(null);
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Failed to submit. Please try again.");
    }
  };

  // Handle Cash Advance selection
  const handleCashAdvanceRequest = () => {
    if (cashAdvanceId) {
      alert("Cash Advance already set!");
      return;
    }
    setIsCashAdvanceOpen(true);
  };

  const closeCashAdvanceForm = () => setIsCashAdvanceOpen(false);

  // Dynamic calculation of excess refund
  useEffect(() => {
    const selectedCashAdvance = availableCashAdvances.find(ca => ca.id === cashAdvanceId);
    if (selectedCashAdvance) {
      const totalSpent = parseFloat(document.getElementById('totalAmountSpent')?.value || 0);
      const refund = selectedCashAdvance.amount - totalSpent;
      setExcessRefund(refund >= 0 ? refund : 0);
    }
  }, [cashAdvanceId]);

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
            <div className="form-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input disabled value={liquidationID || "Loading..."} className="cashAdvInput" id="liquidationId" type="text" readOnly />
            </div>
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
            <div className="form-group">
              <label htmlFor="accountName">Account Name</label>
              <input 
                placeholder="Account name of the request is displayed here.." 
                disabled className="cashAdvInput" id="liquidationId" type="text" readOnly />
            </div>

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
            <div className="form-group">
              <label htmlFor="cashAdvanceId">Cash Advance:</label>
              <select
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
                    {`ID: ${cashAdvance.id} - Amount: ${cashAdvance.amount}`}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btnRequest" onClick={handleCashAdvanceRequest}>
              Request Cash Advance
            </button>
          </div>

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
            <button type="button" className="btnRemove" onClick={() => setFile(null)}>Remove</button>
            <div className="form-group">
              <label htmlFor="totalAmountSpent">Total Amount Spent:</label>
              <input 
                className="cashAdvInput" 
                id="totalAmountSpent" 
                type="number" 
                {...register('totalAmountSpent', { required: 'Total amount is required' })} 
                placeholder="Total Amount Spent" 
              />
              {errors.totalAmountSpent && <span className="error">{errors.totalAmountSpent.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="excessRefund">Excess/For Refund:</label>
              <input disabled className="cashAdvInput" id="excessRefund" type="number" value={excessRefund} readOnly />
            </div>
            <div className="buttons">
              <button type="submit" className="btnSave">Save</button>
              <button type="button" className="btnCancel" onClick={() => reset()}>Cancel</button>
            </div>
          </div>
        </div>
      </form>

      {isCashAdvanceOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <CashAdvance onCancel={closeCashAdvanceForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default LiquidationReport;
