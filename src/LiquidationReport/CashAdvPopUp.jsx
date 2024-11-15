import React from 'react';
import Popup from 'reactjs-popup'; // Correct import from reactjs-popup
import './PopUp.css'; // Where to get the CSS for Pop Up

export default function PopupCashAdv({ closePopup }) { // Accept closePopup as prop
  return (
    <Popup open modal nested onClose={closePopup}>
      <div className='modal'>
        <div className='content'>
          <h1>Cash Advance Request</h1>

          <form>
            <table style={{ width: '100%', margin: 'auto' }}>
              <tbody>
                {/* Cash Advance ID Field */}
                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label htmlFor="cashAdvID">Cash Advance ID:</label>
                  </td>
                  <td>
                    <input className='cashAdvInput' type="text" id="cashAdvID" placeholder="" />
                  </td>
                </tr>

                {/* Account Name Field */}
                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label htmlFor="accountName">Account Name:</label>
                  </td>
                  <td>
                    <input className='cashAdvInput' type="text" id="accountName" placeholder="Enter Account Name" />
                  </td>
                </tr>

                {/* Amount Field */}
                <tr>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>
                    <label htmlFor="amount">Amount:</label>
                  </td>
                  <td>
                    <input className='cashAdvInput' type="number" id="amount" placeholder="Enter Amount" />
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" className="btnSave">Submit Request</button>
              <button type="button" onClick={closePopup}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Popup>
  );
}
