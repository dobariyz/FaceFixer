import React from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import "./signup.css";

const Signup = () => {
    const navigate = useNavigate(); // For navigation

    const handleSignup = (e) => {
      e.preventDefault();
      // Here, add logic to register the user (e.g., API call)
      navigate("/dashboard"); // Redirect to dashboard after successful signup
    };
  
    return (
      <div className="signup-container">
        <h2 className="form-title">Create an Account</h2>
  
        <form onSubmit={handleSignup} className="signup-form">
          <InputField type="text" placeholder="First Name" icon="edit"/>
          <InputField type="text" placeholder="Last Name"  icon="edit"/>
          <InputField type="email" placeholder="Email Address" icon="mail" />
          <InputField type="password" placeholder="Password" icon="lock"/>
          <InputField type="password" placeholder="Confirm Password" icon="lock"/>
  
          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <p className="login-prompt">
          Already have an account? <a href="/" className="login-link">Log in</a>
        </p>
      </div>
        );
    };

export default Signup;
