import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Others
import GTV_Home from './src/GTV_Home.jsx';
import GeneralManager from './src/GeneralManager.jsx';

// Dashboards
import Dashboard_Admin from './src/Dashboard_Admin.jsx';
import Dashboard_GeneralManager from './src/Dashboard_GeneralManager.jsx';
import Dashboard_PropCustodian from './src/Dashboard_PropCustodian.jsx';

// Forms
import Form_LiquidationReport from './src/Form_LiquidationReport.jsx';
import Form_CashAdvanceRequest from './src/Form_CashAdvanceRequest.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<GTV_Home />} />
          <Route path="/genmanager" element={<GeneralManager />} />
          
          {/* Forms */}
          <Route path="/cashadvance" element={<Form_CashAdvanceRequest />} />
          <Route path="/liquidationreport" element={<Form_LiquidationReport />} />
          
          {/* Dashboards */}
          <Route path="/admin" element={<Dashboard_Admin />} />
          <Route path="/generalmanager" element={<Dashboard_GeneralManager />} />
          <Route path="/propcustodian" element={<Dashboard_PropCustodian />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;