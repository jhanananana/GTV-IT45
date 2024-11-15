import React from "react";
import "./src/navbarAndFooter.css";

export const Footer = () => {
  return (
    <>
      <div className="footer">
        <div className="footerLogo-container">
          <img src="/images/logo.png" alt="Logo" />
        </div>
        <div className="footer-bottom">
          JBT building Jose, Romero Rd.,Brgy. Talay, Dumaguete City 6200 Negros
          Oriental, Philippines
        </div>
      </div>
    </>
  );
};

export default Footer;
