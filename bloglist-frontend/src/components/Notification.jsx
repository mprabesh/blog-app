const Notification = ({ notificationMessage }) => {
  const notifyMessage = notificationMessage;
  setTimeout(() => {
    notifyMessage.message = "";
  }, 5000);
  return notifyMessage.message ? (
    <div
      className={
        notificationMessage.messageTypeError
          ? "redClassMessage"
          : "greenClassMessage"
      }
    >
      {notifyMessage.message}
    </div>
  ) : null;
};

export default Notification;
