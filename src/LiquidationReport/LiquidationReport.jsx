import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import PopupCashAdv from './CashAdvPopUp.jsx'; // Assuming the file is in the same directory as LiquidationReport.jsx
import './index.css';

const LiquidationReport = () => {
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Add state to control popup visibility

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
    setIsPopupOpen(true); // Open the popup
  };

  const handleUpdate = () => {
    alert('Form updated successfully!');
  };

  const handleCancel = () => {
    reset();
    setFile(null);
  };

  const closePopup = () => {
    setIsPopupOpen(false); // Close the popup
  };

  return (
    <>
      <nav className="nav">
        <img src="/logo.jpg" width={40} style={{ borderRadius: '100%', marginRight: '15px' }} />
        Galanter & Jones SEA. INC.
      </nav>

      <div className="form-container">
        {/* Left Side */}
        <div className="form-left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1>Liquidation Report</h1>
            <table>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>Liquidation ID:</label>
                  </td>
                  <td>
                    <input type="text" {...register('liquidationId')} defaultValue="1000" readOnly />
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>First Name:</label>
                  </td>
                  <td>
                    <input type="text" {...register('firstName')} placeholder="First Name" />
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>Last Name:</label>
                  </td>
                  <td>
                    <input type="text" {...register('lastName')} placeholder="Last Name" />
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>Activity:</label>
                  </td>
                  <td>
                    <input type="text" {...register('activity')} placeholder="Name of Activity" />
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>Date of Activity:</label>
                  </td>
                  <td>
                    <input type="text" {...register('dateOfActivity')} placeholder="YYYY/MM/DD" defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label>Cash Advance Amount:</label>
                  </td>
                  <td>
                    <input type="number" {...register('cashAdvanceAmount')} placeholder="Cash Advance Amount" />
                  </td>
                </tr>

                <tr>
                  <td></td>
                  <td>
                    <button type="button" onClick={handleCashAdvanceRequest}>Request Cash Advance</button>
                  </td>
                </tr>

              </tbody>
            </table>
          </form>
        </div>

        {/* Right Side */}
        <div className="form-right">
          <label>Upload a photo of receipt</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>{file ? file.name : "Drag and drop file here"}</p>
          </div>

          <tr>
            <td style={{ textAlign: 'right', paddingRight: '10px' }}>
              <label>Total Amount Spent:</label>
            </td>
            <td>
              <input type="number" {...register('totalAmountSpent')} placeholder="Amount Spent" />
            </td>
          </tr>

          <tr>
            <td style={{ textAlign: 'right', paddingRight: '10px' }}>
              <label>Excess/For Refund:</label>
            </td>
            <td>
              <input type="number" {...register('excessRefund')} placeholder="123,456.78" readOnly />
            </td>
          </tr>

          <div className="buttons">
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

