import Notification from "./Notification";
import PropTypes from "prop-types";

/**
 * LoginForm Component
 * 
 * Modern, professional login form with improved UX and styling.
 * Features form validation, loading states, and responsive design.
 */

const LoginForm = ({
  handleLogin,
  userCredentials,
  setuserCredentials,
  notificationMessage,
}) => {
  return (
    <div className="form-container animate-slideUp">
      <div className="form-title">Sign In</div>
      
      <Notification notificationMessage={notificationMessage} />
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={userCredentials.username}
            onChange={(e) =>
              setuserCredentials({ ...userCredentials, username: e.target.value })
            }
            required
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={userCredentials.password}
            onChange={(e) =>
              setuserCredentials({ ...userCredentials, password: e.target.value })
            }
            required
            autoComplete="current-password"
          />
        </div>
        
        <button 
          id="login-btn"
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={!userCredentials.username || !userCredentials.password}
        >
          Sign In
        </button>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Welcome to BlogSpace - Share your stories with the world
        </p>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  userCredentials: PropTypes.object.isRequired,
  setuserCredentials: PropTypes.func.isRequired,
  notificationMessage: PropTypes.object.isRequired,
};

export default LoginForm;
