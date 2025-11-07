import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import axios from 'axios'; // Import axios
import "./signup.css";

const Signup = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate(); // For navigation

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // Replace your handleSignup function in Signup.jsx with this:

const handleSignup = async (e) => {
  e.preventDefault();

  if (userData.password !== userData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  
  if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
    alert("All fields are required!");
    return;
  }

  const requestData = {
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email: userData.email.trim(),
    password: userData.password.trim(),
  };

  console.log("Sending data:", requestData);

  try {
    const response = await axios.post("http://localhost:5000/auth/signupUser", requestData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(response.data);

    if (response.data && response.data.token) {
      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // After signup, always redirect to terms page
      // (new users haven't accepted terms yet)
      navigate("/terms");
    } else {
      navigate("/");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    if (error.response && error.response.status === 400) {
      alert(error.response.data.message);
    } else {
      alert("An unexpected error occurred. Please try again.");
    }
  }
};

  return (
    <div className="signup-container">
      <h2 className="form-title">Create an Account</h2>

      <form onSubmit={handleSignup} className="signup-form">
        <InputField
          type="text"
          placeholder="First Name"
          icon="edit"
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
        />
        <InputField
          type="text"
          placeholder="Last Name"
          icon="edit"
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
        />
        <InputField
          type="email"
          placeholder="Email Address"
          icon="mail"
          name="email"
          value={userData.email}
          onChange={handleChange}
        />
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          name="password"
          value={userData.password}
          onChange={handleChange}
        />
        <InputField
          type="password"
          placeholder="Confirm Password"
          icon="lock"
          name="confirmPassword"
          value={userData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className="signup-button">Sign Up</button>
      </form>

      <p className="login-prompt">
        Already have an account? <a href="/" className="login-link">Log in</a>
      </p>
    </div>
  );
};

export default Signup;
