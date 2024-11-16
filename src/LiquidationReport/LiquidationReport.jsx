import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import CashAdvance from '../CashAdvance/CashAdvance.jsx'; // Import the component
import './LiquidationReport.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import { onSnapshot } from 'firebase/firestore';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import db from "../firebase";

const LiquidationReport = () => {
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Toggle for success popup
  const [isCashAdvanceOpen, setIsCashAdvanceOpen] = useState(false); // Toggle for Cash Advance form

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
    console.log(data);
    setIsPopupOpen(true); // Open the success popup
  };

  const handleCashAdvanceSubmit = () => {
    setIsCashAdvanceOpen(false); // Close Cash Advance form

  };

  const handleCashAdvanceRequest = () => {
    setIsCashAdvanceOpen(true); // Open Cash Advance form
  };

  const closeCashAdvanceForm = () => {
    setIsCashAdvanceOpen(false); // Close the popup
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
    e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Only allow digits
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Left Side */}
        <div className="form-left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 style={{ textAlign: 'right' }}>Liquidation Report</h1>

            {/* Form Fields */}
            <div className="form-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input disabled={true} className="cashAdvInput" id="liquidationId" type="text" {...register('liquidationId')} defaultValue="1000" readOnly/>
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
              <input disabled={true} className="cashAdvInput" id="cashAdvanceAmount" type="number" {...register('cashAdvanceAmount')} placeholder="Cash Advance Amount" onKeyDown={preventInvalidChars} onInput={validateNumberInput} readOnly />
            </div>

            <div className="form-group" style={{ justifyContent: 'right' }}>
              <button type="button" onClick={handleCashAdvanceRequest}>Request Cash Advance</button>
            </div>
          </form>
        </div>

        {/* Right Side */}
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
            <input disabled={true} className="cashAdvInput" id="excessRefund" type="number" {...register('excessRefund')} placeholder="10,000" readOnly />
          </div>

          <div className="buttons" style={{ justifyContent: 'right' }}>
            <button type="button" className="btnSave">Save</button>
            <button type="button" className="btnUpdate" onClick={handleUpdate}>Update</button>
            <button type="button" className="btnCancel" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
        </form>
      </div>

      {/* Render the Cash Advance form conditionally */}
      {isCashAdvanceOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <CashAdvance onCancel={closeCashAdvanceForm} /> {/* Pass onCancel */}
          </div>
        </div>
      )}

      {/* Render the success popup conditionally */}
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
