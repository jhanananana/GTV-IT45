import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";
import db from "../firebase"; // Import your Firebase configuration
import './CashAdvance.css';

const CashAdvance = ({ onCancel }) => {
  const navigate = useNavigate();

  // State for form fields
  const [cashAdvanceId, setCashAdvanceId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [activity, setActivity] = useState('');

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Form validation
    if (!cashAdvanceId || !accountName || !activity) {
      alert("Please fill in all the fields.");
      return;
    }

    try {
      // Add document to the specific Firestore collection and document
      const docRef = doc(db, "Cash Advance", cashAdvanceId); // Use the collection name and document ID
      await setDoc(docRef, {
        cashAdvanceId: cashAdvanceId,
        accountName: accountName,
        activity: activity,
      });

      // Navigate to the dashboard after successful submission
      navigate('/dashboard1');
      alert("Cash Advance Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting Cash Advance Request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="cash-advance-container">
      <div className="cash-advance-form">
        <form onSubmit={handleSubmit}>
          <h1 className="cash-advance-header">Cash Advance Request</h1>
          
          <div className="form-group">
            <label htmlFor="cashAdvanceId">Cash Advance ID:</label>
            <input
              id="cashAdvanceId"
              type="text"
              placeholder="Enter Cash Advance ID"
              value={cashAdvanceId}
              onChange={(e) => setCashAdvanceId(e.target.value)} // Update state
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="accountName">Account Name:</label>
            <input
              id="accountName"
              type="text"
              placeholder="Enter Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)} // Update state
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="activity">Activity:</label>
            <textarea
              id="activity"
              placeholder="Describe the activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)} // Update state
            />
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
