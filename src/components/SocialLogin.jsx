import "./dashboard.css";

const SocialLogin = () => {
    return (
      <div className="social-login">
        <button className="social-button">
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
  export default SocialLogin;