import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import CashAdvance from '../CashAdvance/CashAdvance.jsx';
import './LiquidationReport.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import { setDoc, collection, serverTimestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import db from "../firebase";
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const LiquidationReport = () => {
  const [liquidationID, setLiquidationID] = useState(null);
  const [cashAdvanceId, setCashAdvanceId] = useState(null); // Initial state for cash advance ID
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCashAdvanceOpen, setIsCashAdvanceOpen] = useState(false);

  // Fetch last liquidation ID on mount
  useEffect(() => {
    const fetchLastLiquidationID = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Liquidation"));
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const lastID = lastDoc ? lastDoc.data().liquidationID : 1000;
        setLiquidationID(lastID + 1);
      } catch (error) {
        console.error("Error fetching last liquidation ID: ", error);
      }
    };
    fetchLastLiquidationID();
  }, []);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0].type.startsWith("image/")) {
      setFile(acceptedFiles[0]);
    } else {
      alert("Only image files are allowed!");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  const onSubmit = async (data) => {
    // Check if all required fields are filled
    if (!data.firstName || !data.lastName || !data.activity || !data.totalAmountSpent || !cashAdvanceId || isNaN(data.cashAdvanceAmount)) {
      alert("Please ensure all fields are filled correctly.");
      return;
    }
  
    const cashAdvanceAmount = parseFloat(data.cashAdvanceAmount);
    const totalAmountSpent = parseFloat(data.totalAmountSpent);
    const excess = cashAdvanceAmount - totalAmountSpent;
  
    // Create the liquidation data object
    const docData = {
      activity: data.activity,
      amtSpent: totalAmountSpent,
      cashAdvAmt: cashAdvanceAmount,
      date: serverTimestamp(),
      excess: excess,
      firstname: data.firstName,
      lastname: data.lastName,
      liquidationID,
      cashAdvanceId,  // Ensure this is included
      receipt: file ? file.name : "placeholderreceipt.png",
      status: "Draft", // Save as Draft
    };
  
    try {
      // Save the liquidation as a draft
      await setDoc(doc(collection(db, "Liquidation")), docData);
      // Update the Cash Advance status to Pending if it's a draft
      const cashAdvanceRef = doc(db, "Cash Advance", cashAdvanceId.toString());
      await updateDoc(cashAdvanceRef, { status: "Pending" });
  
      alert('Liquidation report saved as a draft!');
      reset();
      setFile(null);
      setCashAdvanceId(null);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Error submitting form. Please try again.');
    }
  };

  // Modify the Cash Advance request handling
  const handleCashAdvanceRequest = async () => {
    if (cashAdvanceId) {
      alert("Cash Advance already set!");
      return;
    }
    setIsCashAdvanceOpen(true);
  };

  const closeCashAdvanceForm = () => {
    setIsCashAdvanceOpen(false); // Just close the form
  };
  
  
  const handleCancel = () => {
    reset();
    setFile(null);
  };

  const preventInvalidChars = (e) => {
    if (e.key === "e" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  };

  const validateNumberInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

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
              <input className="cashAdvInput" id="firstName" type="text" {...register('firstName')} placeholder="First Name" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input className="cashAdvInput" id="lastName" type="text" {...register('lastName')} placeholder="Last Name" />
            </div>
            <div className="form-group">
              <label htmlFor="activity">Activity:</label>
              <textarea className="cashAdvInput" id="activity" {...register('activity')} placeholder="Describe the activity" rows="3" />
            </div>
            <div className="form-group">
              <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
              <input
                className="cashAdvInput"
                id="cashAdvanceId"
                type="text"
                value={cashAdvanceId ? cashAdvanceId : ""}  // Ensure it's not an object
                placeholder="Cash Advance ID"
                readOnly
              />

              <button type="button" className="btnRequest" onClick={handleCashAdvanceRequest}>
                Request Cash Advance
              </button>
            </div>
          </div>

          <div className="form-right">
            <div className="buttons" style={{ justifyContent: 'right' }}>
              <label>Upload a photo of receipt</label>
              <button type="button" className="btnRemove" onClick={() => setFile(null)}>Remove</button>
            </div>

            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Uploaded Receipt" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <p>Drag and drop file here</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="totalAmountSpent">Total Amount Spent:</label>
              <input className="cashAdvInput" id="totalAmountSpent" type="number" {...register('totalAmountSpent')} placeholder="Total Amount Spent" onKeyDown={preventInvalidChars} onInput={validateNumberInput} />
            </div>

            <div className="form-group">
              <label htmlFor="excessRefund">Excess/For Refund:</label>
              <input disabled className="cashAdvInput" id="excessRefund" type="number" readOnly />
            </div>

            <div className="buttons" style={{ justifyContent: 'right' }}>
              <button type="submit" className="btnSave">Save</button>
              <button type="button" className="btnUpdate">Update</button>
              <button type="button" className="btnCancel" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </form>

      {isCashAdvanceOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <CashAdvance onCancel={closeCashAdvanceForm} onSubmit={closeCashAdvanceForm} />
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Cash Advance Created!</h3>
              <button className="popup-close-btn" onClick={() => setIsPopupOpen(false)}>X</button>
            </div>
            <div className="popup-body">
              <p>Cash Advance ID: {cashAdvanceId}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiquidationReport;
