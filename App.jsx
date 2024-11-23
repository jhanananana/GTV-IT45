import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LiquidationReport from './src/LiquidationReport/LiquidationReport';
import Home from './src/Homepage/home.jsx';
import GenManager from './src/GenManager/GenManager.jsx';
import ReasonForRejecting from './src/ReasonforRejecting/ReasonforRejecting.jsx';
import Dashboard1 from './src/Dashboard1/Dashboard1.jsx';
import Dashboard2 from './src/Dashboard2/Dashboard2.jsx';
import Dashboard3 from './src/Dashboard3/Dashboard3.jsx';
import CashAdvance from './src/CashAdvance/CashAdvance.jsx';


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/genmanager" element={<GenManager />} />
          <Route path="/cashadvance" element={<CashAdvance />} />
          <Route path="/liquidationreport" element={<LiquidationReport />} />
          <Route path="/dashboard1" element={<Dashboard1 />} />
          <Route path="/dashboard2" element={<Dashboard2 />} />
          <Route path="/dashboard3" element={<Dashboard3 />} />
          <Route path="/reason-for-rejecting" element={<ReasonForRejecting />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;