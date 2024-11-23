import React, { useState } from 'react';
import './ReasonForRejecting.css';
import { useNavigate } from 'react-router-dom';

const ReasonForRejecting = ({ onCancel, selectedRecord, onReject }) => { 
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();  
    if (reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    onReject(reason);
  };

  return (
    <div className="reject-container">
      <div className="reject-form">
        <form onSubmit={handleSubmit}>
          <h1 className="reject-header">Reason For Rejecting</h1>
          
          <div className="form-group">
            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
            <input
              id="cashAdvanceId"
              type="text"
              value={selectedRecord.cashAdvanceId}
              readOnly
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="accountName">Account Name:</label>
            <input
              id="accountName"
              type="text"
              value={selectedRecord.accountName}
              readOnly
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="activity">Activity:</label>
            <textarea
              id="activity"
              value={selectedRecord.activity || ""}
              readOnly
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">Reason:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)} // Capture reason
            />
          </div>
          
          <button type="submit" className="btnSubmit">Submit</button>
          <button type="button" className="btnCancel" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ReasonForRejecting;
