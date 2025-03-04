import { useState } from "react"; // Importing useState hook from React to manage component state

// Functional component InputField with destructured props: type, placeholder, and icon
const InputField = ({ type, placeholder, icon }) => {

  // State to toggle password visibility, initially set to false
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  return (
    <div className="input-wrapper"> {/* Wrapper div for styling the input field and icons */}

      <input
        type={isPasswordShown ? 'text' : type} // If password is shown, change type to 'text', else use provided type
        placeholder={placeholder} // Sets the placeholder text from props
        className="input-field" // Assigning a CSS class for styling
        required // Ensures that the input field is required in a form
      />

      <i className="material-symbols-rounded">{icon}</i> {/* Icon next to the input field, e.g., user or email icon */}

      {type === 'password' && ( // Render the visibility toggle icon only if the input type is 'password'
        <i 
          onClick={() => setIsPasswordShown(prevState => !prevState)} // Toggles password visibility when clicked
          className="material-symbols-rounded eye-icon" // Styling for the eye icon
        >
          {isPasswordShown ? 'visibility' : 'visibility_off'} {/* Changes icon based on password visibility state */}
        </i>
      )}

    </div>
  );
};

export default InputField; // Exporting component for use in other parts of the app
