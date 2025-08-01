/**
 * Notification Component
 * 
 * Modern notification component with improved styling and UX.
 * Features proper animations and better visual hierarchy.
 */

const Notification = ({ notificationMessage }) => {
  const notifyMessage = notificationMessage;
  
  // Auto-hide notification after 5 seconds (this should ideally be managed in parent component)
  setTimeout(() => {
    notifyMessage.message = "";
  }, 5000);
  
  if (!notifyMessage.message) {
    return null;
  }

  return (
    <div
      className={`notification ${
        notificationMessage.messageTypeError
          ? "notification-error"
          : "notification-success"
      } animate-slideInDown`}
      role="alert"
      aria-live="polite"
    >
      <span>{notifyMessage.message}</span>
    </div>
  );
};

export default Notification;
