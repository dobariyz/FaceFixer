import "./dashboard.css";

const SocialLogin = () => {
  const handleGoogleLogin = () => {
    // This should redirect to your Spring Boot OAuth endpoint
    window.location.href = 'http://localhost:5000/oauth2/authorization/google';
  };

  return (
    <div className="social-login">
      <button className="social-button" onClick={handleGoogleLogin}>
        <img src="Google.svg" alt="Google" className="social-icon" />
        Google
      </button>
    </div>
  );
};

export default SocialLogin;