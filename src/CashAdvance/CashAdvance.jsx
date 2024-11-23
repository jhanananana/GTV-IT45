import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, query, collection, orderBy, limit } from "firebase/firestore";
import db from "../firebase";
import './CashAdvance.css';

const CashAdvance = ({ onCancel, onSubmit }) => {
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [activity, setActivity] = useState('');

  const fetchLastCashAdvanceId = async () => {
    try {
      const cashAdvanceRef = collection(db, "Cash Advance");
      const q = query(cashAdvanceRef, orderBy("cashAdvanceId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0].data();
        const lastId = lastDoc.cashAdvanceId;

        setCashAdvanceId(lastId + 1);
      } else {
        setCashAdvanceId(10001);
      }
    } catch (error) {
      console.error("Error fetching last Cash Advance ID: ", error);
      setCashAdvanceId(10001);
    }
  };

  useEffect(() => {
    fetchLastCashAdvanceId();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!cashAdvanceId || !accountName || !activity) {
      alert("Please fill in all the fields.");
      return;
    }
  
    try {
      // Save the Cash Advance request as a draft (Pending status)
      const docRef = doc(db, "Cash Advance", cashAdvanceId.toString());
      await setDoc(docRef, {
        cashAdvanceId,
        accountName,
        activity,
        status: "Pending", // Status as Pending for draft
      });
  
      alert("Cash Advance Request submitted! Please complete the liquidation report.");
      onSubmit(cashAdvanceId);
      onCancel();
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
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="activity">Activity:</label>
            <textarea
              id="activity"
              placeholder="Describe the activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
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
