import React from 'react';
import './CashAdvance.css';

const CashAdvanceRequest = () => {
  return (
    <div className="cash-advance-container">
      <div className="cash-advance-form">
        <form>
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
          
          <div className="button-group">
            <button type="submit" className="btn-submit">Submit Request</button>
            <button type="button" className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashAdvanceRequest;
