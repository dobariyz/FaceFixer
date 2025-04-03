import { useNavigate } from "react-router-dom"; // Importing useNavigate hook for navigation
import SocialLogin from "./components/SocialLogin"; // Importing SocialLogin component for third-party login options
import InputField from "./components/InputField"; // Importing reusable InputField component for user input fields
import Footer from "./components/Footer";
import axios from "axios";
import ProtectedRoutes from "./components/ProtectedRoutes";
//<Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />


const App = () => {

  const navigate = useNavigate(); // Initializing the navigate function from React Router

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
    // Here, you can add authentication logic before navigating

    const email = e.target[0].value;  // Getting the email value from the form
    const password = e.target[1].value;  // Getting the password value from the form
    
    try {
      const response = await axios.post('http://localhost:5000/auth/loginUser', { email, password }); // Make a POST request to backend
      const { token } = response.data;  // Assuming the backend sends a 'token' in the response

      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="login-container"> {/* Container div for login form styling */}
      
      <h2 className="form-title">Log in with</h2> {/* Login title */}

      <SocialLogin /> {/* Component for third-party login buttons (Google, Facebook, etc.) */}

      <p className="separator"><span>or</span></p> {/* Separator with "or" text for visual clarity */}

      <form onSubmit={handleLogin} className="login-form"> {/* Login form with submission handler */}
        
        <InputField type="email" placeholder="Email address" icon="mail" /> {/* Email input field */}
        <InputField type="password" placeholder="Password" icon="lock" /> {/* Password input field */}

        <a href="#" className="forgot-password-link">Forgot password?</a> {/* Link for password recovery */}

        <button type="submit" className="login-button">Log In</button> {/* Submit button to trigger login */}

      </form>

      <p className="signup-prompt"> {/* Sign-up prompt for new users */}
        Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
      </p>

    <div>
      <Footer/>
    </div>

    </div>
    
  );
};

export default App; // Exporting the App component for use in other parts of the application
