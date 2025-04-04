import React, { useState } from 'react';  // Ensure this is here
import './ReasonForRejecting.css';
import { useNavigate } from 'react-router-dom';

const ReasonForRejecting = ({ onClose, selectedRecord, onReject }) => { 
  const [reason, setReason] = useState("");  // Correct usage of useState
  const navigate = useNavigate();

  if (!selectedRecord) {
    return <div>Error: No record selected for rejection.</div>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();  
    if (reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    onReject(reason); // Pass the reason to the parent component (Dashboard1.jsx)
  };

    const handleFormClick = (event) => {
    event.stopPropagation();
  };


  return (
    <div className="reject-container">
      <div className="gtv_reject-form" onClick={handleFormClick}>
        <form onSubmit={handleSubmit}>
          <h1 className="reject-header">Reason For Rejecting</h1>
          
          <div className="gtv_form-group">
            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
            <input
              id="cashAdvanceId"
              type="text"
              className ="gtv_textarea"
              value={selectedRecord.cashAdvanceId || "N/A"}  // Display "N/A" if undefined
              readOnly
            />
          </div>
          
          <div className="gtv_form-group">
            <label htmlFor="accountName">Account Name:</label>
            <input
              id="accountName"
              type="text"
              value={selectedRecord.accountName || "N/A"}  // Display "N/A" if undefined
              readOnly
            />
          </div>
          
          <div className="gtv_form-group">
            <label htmlFor="activity">Activity:</label>
            <textarea
              id="activity"
              value={selectedRecord.activity || "No activity provided"}  // Display default message if undefined
              readOnly
            />
          </div>
          
          <div className="gtv_form-group">
            <label htmlFor="reason">Reason:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)} // Capture reason
            />
          </div>
          
          <button type="submit" className="gtv_buttonLF gtv_btnSubmit">Submit</button>
          <button type="button" className="gtv_buttonLF gtv_btnCancel" onClick={onClose}>Cancel</button>  {/* Use onClose instead of onCancel */}
        </form>
      </div>
    </div>
  );
};

export default ReasonForRejecting;
