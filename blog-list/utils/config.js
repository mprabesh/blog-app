require("dotenv").config();

const mongoURL =
  process.env.NODE_ENV !== "test"
    ? process.env.MONGO_URL
    : process.env.TEST_MONGO_URL;
const PORT = process.env.PORT;

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = { mongoURL, PORT, SECRET_KEY };
