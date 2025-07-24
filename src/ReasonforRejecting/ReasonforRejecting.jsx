import React, { useState } from 'react';
import './ReasonforRejecting.css';
import { useNavigate } from 'react-router-dom';
import { X, Send } from 'lucide-react'; // Use 'X' instead of 'XCircle' for simpler close button

const ReasonForRejecting = ({ onClose, selectedRecord, onReject }) => {
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  if (!selectedRecord) {
    return <div className="reject-error">Error: No record selected for rejection.</div>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    onReject(reason);
  };

  const handleFormClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="reject-container">
      <div className="gtv_reject-form" onClick={handleFormClick}>
        {/* Close Icon */}
        <button className="gtv_close-button" onClick={onClose} type="button" aria-label="Close">
          <X size={20} />
        </button>

        <h2 className="reject-header">Reject Cash Advance</h2>

        <form onSubmit={handleSubmit}>
          <div className="gtv_form-group">
            <label htmlFor="reason">Reason:</label>
            <textarea
              id="reason"
              className="gtv_textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection"
            />
          </div>

          <div className="gtv_button-group">
            <button type="submit" className="gtv_button gtv_btnSubmit">
              <Send size={16} style={{ marginRight: '6px' }} />
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReasonForRejecting;
