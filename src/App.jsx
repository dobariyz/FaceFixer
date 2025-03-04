import { useNavigate } from "react-router-dom"; // Importing useNavigate hook for navigation
import SocialLogin from "./components/SocialLogin"; // Importing SocialLogin component for third-party login options
import InputField from "./components/InputField"; // Importing reusable InputField component for user input fields

const App = () => {
  const navigate = useNavigate(); // Initializing the navigate function from React Router

  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
    // Here, you can add authentication logic before navigating
    navigate("/dashboard"); // Redirect to the dashboard page after successful login
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
        Don&apos;t have an account? <a href="#" className="signup-link">Sign up</a>
      </p>

    </div>
  );
};

export default App; // Exporting the App component for use in other parts of the application
