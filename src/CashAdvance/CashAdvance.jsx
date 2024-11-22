import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import db from "../firebase"; // Import your Firebase configuration
import './CashAdvance.css';

const CashAdvance = ({ onCancel }) => {
  const navigate = useNavigate();

  // State for form fields
  const [cashAdvanceId, setCashAdvanceId] = useState(null); // Set initial state to null
  const [accountName, setAccountName] = useState('');
  const [activity, setActivity] = useState('');

  // Fetch the last Cash Advance ID from Firestore and increment it
  const fetchLastCashAdvanceId = async () => {
    try {
      const currentIdDocRef = doc(db, "CashAdvanceMeta", "currentId");
      const currentIdDoc = await getDoc(currentIdDocRef);
  
      if (!currentIdDoc.exists()) {
        await setDoc(currentIdDocRef, { currentId: 10001 });
        setCashAdvanceId(10001);
      } else {
        const currentId = currentIdDoc.data().currentId;
        if (typeof currentId === 'number') {
          setCashAdvanceId(currentId);
        } else {
          console.error('Invalid ID format in Firestore');
          setCashAdvanceId(10001);  // Default fallback
        }
      }
    } catch (error) {
      console.error("Error fetching last Cash Advance ID: ", error);
      setCashAdvanceId(10001); // Default to 10001 if any error occurs
    }
  };

  // Fetch the last Cash Advance ID when the component mounts
  useEffect(() => {
    fetchLastCashAdvanceId();
  }, []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Form validation
    if (!cashAdvanceId || !accountName || !activity) {
      alert("Please fill in all the fields.");
      return; // Prevent form submission
    }

    try {
      // Create the document for the Cash Advance request using the incremented ID
      const docRef = doc(db, "Cash Advance", cashAdvanceId.toString()); 
      await setDoc(docRef, {
        cashAdvanceId: cashAdvanceId,
        accountName: accountName,
        activity: activity,
      });

      // Increment the Cash Advance ID in the CashAdvanceMeta document
      await updateDoc(doc(db, "CashAdvanceMeta", "currentId"), { currentId: cashAdvanceId + 1 });

      // Navigate to the dashboard after successful submission
      alert("Cash Advance Request submitted successfully!");
      navigate('/dashboard1');
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
              placeholder="Cash Advance ID"
              value={cashAdvanceId !== null ? cashAdvanceId : 'Loading...'}
              readOnly
              disabled
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
