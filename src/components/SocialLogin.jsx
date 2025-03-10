import "./dashboard.css";

const SocialLogin = () => {
    return (
      <div className="social-login">
        <button className="social-button">
          <img src="Google.svg" alt="Google" className="social-icon" />
          Google
        </button>
        <button className="social-button">
          <img src="apple.svg" alt="Apple" className="social-icon" />
          Apple
        </button>
      </div>
    )
  }
  export default SocialLogin;