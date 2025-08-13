import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, query, collection, orderBy, limit } from "firebase/firestore";
import db from "./firebase.js";
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBarAndFooter/navbar.jsx';
// import Footer from '../NavBarAndFooter/footer.jsx';
import Modal from './Modal.jsx';

const CashAdvance = () => {
  const [cashAdvanceId, setCashAdvanceId] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [activity, setActivity] = useState('');
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState('');
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
      setFormError('Error: Please fill in all fields.');
      return;
    }
    setFormError('');
    try {
      const docRef = doc(db, "Cash Advance", cashAdvanceId.toString());
      await setDoc(docRef, {
        cashAdvanceId,
        accountName,
        activity,
        status: "Pending",
        isApproved: null,
      });

      // alert("Cash Advance Request submitted successfully!");
      // navigate("/dashboard1");
      setShowSuccessModal(true);
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
            {formError && (
              <div className="flex items-start gap-2 bg-red-100 mt- border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
                <svg
                  className="w-5 h-5 mt-0.5 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}
            <div>
              <label htmlFor="cashAdvanceId" className="block mt-3 font-semibold text-gray-700 mb-2">
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
              <label htmlFor="accountName" className="bblock mt-3 font-semibold text-gray-700 mb-2">
                Account Name:
              </label>
              <input
                id="accountName"
                type="text"
                placeholder="Enter Account Name"
                value={accountName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, ""); // Remove numbers
                  setAccountName(value);
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label htmlFor="activity" className="block mt-3 font-semibold text-gray-700 mb-2">
                Activity:
              </label>
              <textarea
                id="activity"
                placeholder="Describe the activity"
                value={activity}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, ""); // Remove numbers
                  setActivity(value);
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>


            <div className="text-right">
              <button
                type="submit"
                className="bg-[#2D3E50] hover:bg-[#1f2d3a] text-white font-semibold px-8 py-3 rounded-lg transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/dashboard1");
        }}
        title="Submission Successful"
        icon="success"
        footer={
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate("/dashboard1");
            }}
            className="px-4 py-2 bg-[#1e293b] text-white rounded hover:bg-[#0f172a] transition"
          >
            Go to Dashboard
          </button>
        }
      ><p>Cash advance request has been submitted successfully.</p>
      </Modal>
    </div>
  );
};

export default CashAdvance;
