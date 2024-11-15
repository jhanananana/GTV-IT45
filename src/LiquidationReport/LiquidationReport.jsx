import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import PopupCashAdv from './CashAdvPopUp.jsx';
import './LiquidationReport.css';

const LiquidationReport = () => {
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  const onSubmit = (data) => {
    console.log(data);
    alert('Form submitted successfully!');
  };

  const handleCashAdvanceRequest = () => {
    setIsPopupOpen(true);
  };

  const handleUpdate = () => {
    alert('Form updated successfully!');
  };

  const handleCancel = () => {
    reset();
    setFile(null);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className="form-container">
        {/* Left Side */}
        <div className="form-left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 style={{ textAlign: 'right'}}>Liquidation Report</h1>

            <div className="form-group">
              <label htmlFor="liquidationId">Liquidation ID:</label>
              <input className='cashAdvInput' id="liquidationId" type="text" {...register('liquidationId')} defaultValue="1000" readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input className='cashAdvInput' id="firstName" type="text" {...register('firstName')} placeholder="First Name" />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input className='cashAdvInput' id="lastName" type="text" {...register('lastName')} placeholder="Last Name" />
            </div>

            <div className="form-group">
              <label htmlFor="activity">Activity:</label>
              <input className='cashAdvInput' id="activity" type="text" {...register('activity')} placeholder="Name of Activity" />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfActivity">Date of Activity:</label>
              <input className='cashAdvInput' id="dateOfActivity" type="text" {...register('dateOfActivity')} placeholder="YYYY/MM/DD" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="form-group">
              <label htmlFor="cashAdvanceAmount">Cash Advance Amount:</label>
              <input className='cashAdvInput' id="cashAdvanceAmount" type="number" {...register('cashAdvanceAmount')} placeholder="Cash Advance Amount" />
            </div>
            
            <div className="form-group" style={{justifyContent: 'right'}}>
              <button type="button" onClick={handleCashAdvanceRequest}>Request Cash Advance</button>
            </div>

          </form>
        </div>

        {/* Right Side */}
        <div className="form-right">
          <label>Upload a photo of receipt</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>{file ? file.name : "Drag and drop file here"}</p>
          </div>

          <div className="form-group">
            <label htmlFor="totalAmountSpent">Total Amount Spent:</label>
            <input className='cashAdvInput' id="totalAmountSpent" type="number" {...register('totalAmountSpent')} placeholder="Amount Spent" />
          </div>

          <div className="form-group">
            <label htmlFor="excessRefund">Excess/For Refund:</label>
            <input className='cashAdvInput' id="excessRefund" type="number" {...register('excessRefund')} placeholder="123,456.78" readOnly />
          </div>

          <div className="buttons" style={{justifyContent: 'right'}}>
            <button type="submit" className="btnSave">Save</button>
            <button type="button" className="btnUpdate" onClick={handleUpdate}>Update</button>
            <button type="button" className="btnCancel" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>


      {/* Render the popup component conditionally */}
      {isPopupOpen && <PopupCashAdv closePopup={closePopup} />}
    </>
  );
};

export default LiquidationReport;
