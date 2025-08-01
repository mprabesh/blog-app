/* eslint-disable react/display-name */
import { useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";

/**
 * Toggleable Component
 * 
 * Modern toggleable component with smooth animations and improved UX.
 * Features proper button styling and smooth show/hide transitions.
 */

const Togglable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  useImperativeHandle(refs, () => {
    return {
      toggleVisibility,
    };
  });

  return (
    <div className="toggleable-container">
      {!visible && (
        <div className="animate-fadeIn">
          <button 
            onClick={toggleVisibility}
            className="btn btn-primary"
          >
            ✨ {props.buttonLabel}
          </button>
        </div>
      )}
      
      {visible && (
        <div className="animate-slideUp">
          <div className="mb-4">
            {props.children}
          </div>
          <div className="text-center">
            <button 
              onClick={toggleVisibility}
              className="btn btn-secondary"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Togglable;
