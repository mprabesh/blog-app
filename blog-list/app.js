const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { info } = require("./utils/logger");
const blogsController = require("./controllers/blogs");
const userController = require("./controllers/user");
const loginController = require("./controllers/login");
const testingRouter = require("./controllers/testing");
const { mongoURL } = require("./utils/config");
const {
  errorHandler,
  requestLogger,
  unknownEndpoint,
} = require("./utils/middleware");

app.use(express.json());
app.use(cors());


mongoose.set("strictQuery", false);
mongoose
  .connect(mongoURL,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    info("Connected to DB successfully!!");
  })
  .catch((err) => info(err));

app.use(requestLogger);

if (process.env.NODE_ENV === "test") {
  app.use("/api/testing", testingRouter);
}

// Health check endpoints
app.get("/",(req,res)=>{res.send("Server is running")});
app.get("/api/ping", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.use("/api/login", loginController);
app.use("/api/users", userController);
app.use("/api/blogs", blogsController);

app.use(unknownEndpoint);

app.use(errorHandler);

module.exports = app;
