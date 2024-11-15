import React from "react";
import { useForm } from "react-hook-form"; // Hook for form handling
import "./Dashboard.css";

const Dashboard = () => {
  const { register, handleSubmit } = useForm(); // Initialize useForm hook

  const onSubmit = (data) => {
    console.log(data); // Handle form submission
  };

  return (
    <div>
      {/* Form Container for left and right side */}
      <div className="dashboard-container">
        {/* Left Side (Cash Adv ID and Account Name) */}
        <div className="dashboard-left">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Cash Advance ID */}
            <div className="dashboard-group">
              <label htmlFor="liquidationId">Cash Advance ID:</label>
              <input
                className="dashBoardInput"
                id="liquidationId"
                type="text"
                {...register("liquidationId")}
                defaultValue="1000"
                readOnly
              />
            </div>

            {/* Account Name */}
            <div className="dashboard-group">
              <label htmlFor="accountName">Account Name:</label>
              <input
                className="dashBoardInput"
                id="accountName"
                type="text"
                {...register("accountName")}
                defaultValue="Account Name"
                readOnly
              />
            </div>
          </form>
        </div>

        {/* Right Side (Cash Advance Amount) */}
        <div className="dashboard-right">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Cash Advance Amount */}
            <div className="dashboard-group">
              <label htmlFor="totalAmountSpent">Cash Advance Amount:</label>
              <input
                className="dashBoardInput"
                id="totalAmountSpent"
                type="number"
                {...register("totalAmountSpent")}
                defaultValue="1000"
                readOnly
              />
            </div>
          </form>
        </div>
      </div>

      <div className="content">
        <div className="title-part">
          <h2>Cash Advance Amount Records</h2>
        </div>
        <div className="tables">
          <Section
            title="Cash Advance Request"
            columns={[
              "Liquidation ID",
              "Cash Advance ID",
              "Account Name",
              "Cash Advance Amount",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Section component for displaying table
const Section = ({ title, columns }) => (
  <div className="section">
    <div className="section-header">
      <h3>{title}</h3>
      <Legend />
    </div>
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {columns.map((_, index) => (
            <td key={index}></td>
          ))}
        </tr>
        <tr>
          {columns.map((_, index) => (
            <td key={index}></td>
          ))}
        </tr>
        <tr>
          {columns.map((_, index) => (
            <td key={index}></td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

// Legend for status indicators
const Legend = () => (
  <div className="legend">
    <span className="legend-item open">Open</span>
    <span className="legend-item closed-approved">Closed (Approved)</span>
    <span className="legend-item closed-declined">Closed (Declined)</span>
  </div>
);

export default Dashboard;
