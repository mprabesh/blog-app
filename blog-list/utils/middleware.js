const { info } = require("./logger");
const { SECRET_KEY } = require("./config");
const jwt = require("jsonwebtoken");

const requestLogger = (request, response, next) => {
  info("Method:", request.method);
  info("Path:  ", request.path);
  info("Body:  ", request.body);
  info("---");
  next();
};

const tokenExtractor = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "missing token" });
  }
  const token = req.headers.authorization.split(" ")[1];
  req.token = token;
  next();
};

const userExtractor = (req, res, next) => {
  const token = req.token;
  const decodedToken = jwt.verify(token, SECRET_KEY);
  if (!decodedToken.userId) {
    return res.status(401).json({ error: "invalid token" });
  }
  req.user = decodedToken.userId;
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  info(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: error.message });
  }
  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
