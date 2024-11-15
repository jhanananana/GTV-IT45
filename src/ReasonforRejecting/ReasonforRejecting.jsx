import React from 'react';
import './ReasonForRejecting.css';

const ReasonForRejecting = () => {
  return (
    <div className="reject-container">
      <div className="reject-form">
        <form>
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
          
          <div className="button-group">
            <button type="submit" className="btn-submit">Submit</button>
            <button type="button" className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReasonForRejecting;
