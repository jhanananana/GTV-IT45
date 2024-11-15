import React from 'react';
import Popup from 'reactjs-popup'; // Correct import from reactjs-popup
import 'reactjs-popup/dist/index.css'; // Where to get the CSS for Pop Up

export default function PopupCashAdv({ closePopup }) { // Accept closePopup as prop
  return (
    <Popup open modal nested onClose={closePopup}>
      <div className='modal'>
        <div className='content'>
          Welcome to GFG!!!
        </div>
        <div>
          <button onClick={closePopup}>Close modal</button>
        </div>
      </div>
    </Popup>
  );
}