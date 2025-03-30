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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }


    try {
      const response = await axios.post("http://localhost:5000/signup", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      },
    );
  

      console.log(response.data); // Handle the response, e.g., success message or token
      navigate("/App"); // Redirect to dashboard after successful signup
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error during signup. Please try again.");
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
