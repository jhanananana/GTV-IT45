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
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
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
    // Validation before submitting
    if (!data.firstName || !data.lastName || !data.activity || !data.totalAmountSpent || !data.cashAdvanceAmount || !cashAdvanceId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const docData = {
        activity: data.activity,
        amtSpent: parseFloat(data.totalAmountSpent),
        cashAdvAmt: parseFloat(data.cashAdvanceAmount),
        date: serverTimestamp(),
        excess: parseFloat(data.cashAdvanceAmount) - parseFloat(data.totalAmountSpent),
        firstname: data.firstName,
        lastname: data.lastName,
        liquidationID,
        cashAdvanceId, // Link Cash Advance ID
        receipt: "placeholderreceipt.png",
      };

      await setDoc(collection(db, "Liquidation"), docData);

      // Increment the liquidation ID for the next report
      const nextLiquidationID = liquidationID + 1;
      await updateDoc(doc(db, "Liquidation", "lastLiquidationID"), { liquidationID: nextLiquidationID });

      alert('Form submitted and data saved successfully!');
      reset();
      setFile(null);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Error submitting form. Please try again.');
    }
  };

  const openCashAdvanceForm = () => {
    return new Promise((resolve) => {
      setIsCashAdvanceOpen(true);
      const closeCashAdvanceForm = (cashAdvanceId) => {
        setCashAdvanceId(cashAdvanceId);
        setIsCashAdvanceOpen(false);
        resolve(cashAdvanceId);
      };
      return closeCashAdvanceForm;
    });
  };

  const handleCashAdvanceRequest = () => {
    openCashAdvanceForm().then(() => {
      alert("Cash Advance ID set!");
    });
  };

  const closeCashAdvanceForm = () => {
    setIsCashAdvanceOpen(false);
  };

  const handleUpdate = () => {
    alert('Form updated successfully!');
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
      <Breadcrumbs links={breadcrumbsLinks} /> {/* Add Breadcrumbs */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-container">
          <div className="form-left">
            <h1 style={{ textAlign: 'right' }}>Liquidation Report</h1>

            <div className="form-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input disabled value={liquidationID || "Loading..."} className="cashAdvInput" id="liquidationId" type="text" {...register('liquidationId')} readOnly />
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
              <textarea className="cashAdvInput" id="activity" {...register('activity')} placeholder="Describe the activity" rows="3" style={{ resize: 'none' }} />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfActivity">Date of Activity:</label>
              <input
                className="cashAdvInput"
                id="dateOfActivity"
                type="date"
                {...register('dateOfActivity')}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cashAdvanceAmount">Cash Advance Amount:</label>
              <input disabled className="cashAdvInput" id="cashAdvanceAmount" type="number" {...register('cashAdvanceAmount')} placeholder="Cash Advance Amount" readOnly />
            </div>

            <div className="form-group" style={{ justifyContent: 'right' }}>
              <button type="button" onClick={handleCashAdvanceRequest}>Request Cash Advance</button>
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
              <input disabled className="cashAdvInput" id="excessRefund" type="number" {...register('excessRefund')} readOnly />
            </div>

            <div className="buttons" style={{ justifyContent: 'right' }}>
              <button type="submit" className="btnSave">Save</button>
              <button type="button" className="btnUpdate" onClick={handleUpdate}>Update</button>
              <button type="button" className="btnCancel" onClick={handleCancel}>Cancel</button>
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

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Form submitted successfully!</h2>
            <button onClick={() => setIsPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiquidationReport;
