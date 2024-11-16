import React from 'react';
import './ReasonForRejecting.css';
import { useNavigate } from 'react-router-dom';

const ReasonForRejecting = ({ onCancel }) => {  // Accept onCancel as a prop
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();  // Prevent the default form submission
    // Add any rejection logic here if needed

    navigate("/dashboard3");  // Navigate to Dashboard2 after rejection submission
  };

  return (
    <div className="reject-container">
      <div className="reject-form">
        <form onSubmit={handleSubmit}>
          <h1 className="reject-header">Reason For Rejecting</h1>
          
          <div className="form-group">
            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
            <input id="cashAdvanceId" type="text" placeholder="#####" readOnly />
          </div>
          
          <div className="form-group">
            <label htmlFor="accountName">Account Name:</label>
            <input id="accountName" type="text" placeholder="Account Name" readOnly />
          </div>
          
          <div className="form-group">
            <label htmlFor="activity">Activity:</label>
            <textarea id="activity" placeholder="Activity" readOnly />
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">Reason:</label>
            <textarea id="reason" placeholder="Reason" />
          </div>
          
          <button type="submit" className="btnSubmit">Submit</button>
          <button type="button" className="btnCancel" onClick={onCancel}>Cancel</button> {/* Use onCancel here */}
        </form>
      </div>
    </div>
  );
};

export default ReasonForRejecting;
