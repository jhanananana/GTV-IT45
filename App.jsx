import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LiquidationReport from './src/LiquidationReport/LiquidationReport';
import Home from './src/Homepage/home.jsx';
import Dashboard from './src/Dashboard-Admin/Dashboard.jsx';
import ReasonForRejecting from './src/ReasonForRejecting/ReasonForRejecting.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/liquidationreport" element={<LiquidationReport />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reason-for-rejecting" element={<ReasonForRejecting />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
