import { useNavigate } from "react-router-dom";
import SocialLogin from "./components/SocialLogin";
import InputField from "./components/InputField";
import axios from "axios";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();

  // Replace your handleLogin function in Login.jsx with this:

const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = e.target[0].value;
  const password = e.target[1].value;
  
  try {
    const response = await axios.post('http://localhost:5000/auth/loginUser', { email, password });
    
    if (response.status === 200 && response.data.token) {
      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // Check if user has accepted terms
      try {
        const termsResponse = await axios.get('http://localhost:5000/auth/check-terms', {
          headers: {
            'Authorization': `Bearer ${response.data.token}`
          }
        });

        // Redirect based on terms acceptance
        if (termsResponse.data && termsResponse.data.termsAccepted) {
          navigate('/dashboard');
        } else {
          navigate('/terms');
        }
      } catch (termsError) {
        console.error('Error checking terms:', termsError);
        // Default to terms page if check fails for safety
        navigate('/terms');
      }
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    alert(error.response?.data?.message || "Login failed! Please check your credentials.");
  }
};

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2 className="form-title">Log in with</h2>
        
        <SocialLogin />
        
        <p className="separator"><span>or</span></p>
        
        <form onSubmit={handleLogin} className="login-form">
          <InputField type="email" placeholder="Email address" icon="mail" />
          <InputField type="password" placeholder="Password" icon="lock" />
          
          <a href="#" className="forgot-password-link">Forgot password?</a>
          
          <button type="submit" className="login-button">Log In</button>
        </form>

        <p className="signup-prompt">
          Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;