import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CashAdvance.css';

const CashAdvance = ({ onCancel }) => { // Accept onCancel prop
  const navigate = useNavigate();

  const handleSubmit = (event) => {  // Correct the syntax for the handleSubmit function
    navigate('/dashboard1'); // Navigate to the dashboard
  };

  return (
    <div className="cash-advance-container">
      <div className="cash-advance-form">
        <form onSubmit={handleSubmit}>
          <h1 className="cash-advance-header">Cash Advance Request</h1>
          
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
            <textarea id="activity" placeholder="Activity" />
          </div>
          
          <div>
            <button type="submit" className="btnSubmit">Submit Request</button>
            <button type="button" className="btnCancel" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashAdvance;
