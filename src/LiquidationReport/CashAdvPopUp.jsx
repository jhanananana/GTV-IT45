import React from 'react';
import Popup from 'reactjs-popup'; // Correct import from reactjs-popup
import 'reactjs-popup/dist/index.css'; // Where to get the CSS for Pop Up

export default function PopupCashAdv({ closePopup }) { // Accept closePopup as prop
  return (
    <Popup open modal nested onClose={closePopup}>
      <div className='modal'>
        <div className='content'>
          <h1>Cash Advance Request</h1>

            <button type="submit" className="btnSave">Submit Request</button>
            <button onClick={closePopup}>Cancel</button>
            </div>
        </div>
    </Popup>
  );
}
