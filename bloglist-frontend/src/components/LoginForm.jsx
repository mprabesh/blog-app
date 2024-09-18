import Notification from "./Notification";
import PropTypes from "prop-types";

const LoginForm = ({
  handleLogin,
  userCredentials,
  setuserCredentials,
  notificationMessage,
}) => {
  return (
    <div>
      <h2>login to application</h2>
      <Notification notificationMessage={notificationMessage} />
      <form onSubmit={handleLogin}>
        username{" "}
        <input
          id="username"
          type="text"
          value={userCredentials.username}
          onChange={(e) =>
            setuserCredentials({ ...userCredentials, username: e.target.value })
          }
        />
        <br />
        password{" "}
        <input
          id="password"
          type="password"
          value={userCredentials.password}
          onChange={(e) =>
            setuserCredentials({ ...userCredentials, password: e.target.value })
          }
        />
        <br />
        <button id="login-btn">login</button>
      </form>
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
