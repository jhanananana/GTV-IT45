import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, query, collection, orderBy, limit } from "firebase/firestore";
import db from "./firebase.js";
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBarAndFooter/navbar.jsx'; 
// import Footer from '../NavBarAndFooter/footer.jsx';

const CashAdvance = () => {
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [activity, setActivity] = useState('');
  const navigate = useNavigate();

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
      const docRef = doc(db, "Cash Advance", cashAdvanceId.toString());
      await setDoc(docRef, {
        cashAdvanceId,
        accountName,
        activity,
        status: "Pending",
        isApproved: null,
      });

      alert("Cash Advance Request submitted successfully!");
      navigate("/dashboard1");
    } catch (error) {
      console.error("Error submitting Cash Advance Request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center px-4 py-10">
        <div className="bg-white w-full max-w-xl rounded-lg shadow-md p-10">
          <h1 className="text-2xl font-semibold mb-6 text-left text-[#2D3E50]">
            Cash Advance Request Form
          </h1>

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
            <div>
              <label htmlFor="cashAdvanceId" className="block text-gray-700 mb-1">
                Cash Advance ID:
              </label>
              <input
                id="cashAdvanceId"
                type="text"
                value={cashAdvanceId !== null ? cashAdvanceId : 'Loading...'}
                disabled
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="accountName" className="block text-gray-700 mb-1">
                Account Name:
              </label>
              <input
                id="accountName"
                type="text"
                placeholder="Enter Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label htmlFor="activity" className="block text-gray-700 mb-1">
                Activity:
              </label>
              <textarea
                id="activity"
                placeholder="Describe the activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="bg-[#2D3E50] hover:bg-[#1f2d3a] text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default CashAdvance;
