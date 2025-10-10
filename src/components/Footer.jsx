import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; 2025 FaceFixer. All Rights Reserved.
        </p>
        <p className="footer-contact">
          Contact: <a href="mailto:contact@facefixer.com">contact@facefixer.com</a> | 
          Phone: <a href="tel:+11234567890">(123) 456-7890</a>
        </p>
        <p className="footer-address">
          Address: 7897 McLaughlin Rd, Brampton, ON L6Y 5H9
        </p>
      </div>
    </footer>
  );
};

export default Footer;