const app = require("./app");
const { PORT, mongoURL } = require("./utils/config");
const { info } = require("./utils/logger");

app.listen(PORT, () => {
  info(`Listening to port ${PORT} and DB URL is ${mongoURL}`);
});
