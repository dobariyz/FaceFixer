import "./dashboard.css";

const SocialLogin = () => {
    return (
      <div className="social-login">
        <button className="social-button" onClick={handleGoogleLogin}>
          <img src="Google.svg" alt="Google" className="social-icon" />
          Google
        </button>
        <button className="social-button">
          <img src="Facebook.jpeg" alt="Facebook" className="social-icon" />
          Facebook
        </button>
      </div>
    )

    
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/oauth2/authorization/google"; // Redirect user to backend
  };
  export default SocialLogin;