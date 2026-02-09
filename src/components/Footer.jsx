import React, { useState } from "react";
import "./footer.css";
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <footer className="enhanced-footer">
      <div className="footer-container">
        <div className="footer-newsletter">
  <h2 className="newsletter-title">
    Join our community or contact us directly{" "}
    <span className="newsletter-accent">for tailored skincare guidance.</span>
  </h2>
  
  <form className="newsletter-form" onSubmit={handleSubscribe}>
    <input
      type="email"
      className="newsletter-input"
      placeholder="Email address here"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <button type="submit" className="newsletter-btn">
      {subscribed ? "Subscribed! ✓" : "Subscribe Now"}
    </button>
  </form>
</div>
        {/* Brand */}
        <div className="footer-brand">
          <h2 className="footer-brand-name">FaceFixer</h2>
        </div>

        {/* Navigation */}
        <nav className="footer-nav">
          <div className="footer-nav-row">
            <a href="#home" className="footer-link">Home</a>
            <a href="#services" className="footer-link">Services</a>
            <a href="#about" className="footer-link">About</a>
            <a href="#blog" className="footer-link">Blog</a>
          </div>
        </nav>

        {/* Social Icons */}
        <div className="footer-social">
          <a href="https://twitter.com"><FaTwitter /></a>
          <a href="https://instagram.com"><FaInstagram /></a>
          <a href="https://linkedin.com"><FaLinkedin /></a>
          <a href="https://facebook.com"><FaFacebook /></a>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            ©2025 FaceFixer. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
