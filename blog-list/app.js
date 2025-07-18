/**
 * Express Application Configuration
 * 
 * This file configures the main Express.js application with all necessary middleware,
 * database connections, routes, and error handling. It serves as the central hub
 * for the blog application's backend API.
 * 
 * Features:
 * - MongoDB Atlas connection with Mongoose ODM
 * - CORS enabled for cross-origin requests
 * - JSON body parsing middleware
 * - Request logging for debugging
 * - Health check endpoints for monitoring
 * - RESTful API routes for blogs, users, and authentication
 * - Error handling and unknown endpoint middleware
 */

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { info } = require("./utils/logger");

// Import route controllers
const blogsController = require("./controllers/blogs");
const userController = require("./controllers/user");
const loginController = require("./controllers/login");
const testingRouter = require("./controllers/testing");

// Import configuration and middleware
const { mongoURL } = require("./utils/config");
const {
  errorHandler,
  requestLogger,
  unknownEndpoint,
} = require("./utils/middleware");

/**
 * Core Middleware Setup
 * 
 * Configure essential middleware for request processing:
 * - express.json(): Parse JSON request bodies
 * - cors(): Enable Cross-Origin Resource Sharing for frontend communication
 */
app.use(express.json());
app.use(cors());

/**
 * Database Connection
 * 
 * Connect to MongoDB Atlas using Mongoose ODM.
 * The connection URL is loaded from environment variables for security.
 * 
 * Configuration:
 * - strictQuery: false - Allows flexible query syntax
 * - useNewUrlParser: true - Uses new MongoDB connection string parser
 * - useUnifiedTopology: true - Uses new Server Discover and Monitoring engine
 */
mongoose.set("strictQuery", false);
mongoose
  .connect(mongoURL,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    info("Connected to DB successfully!!");
  })
  .catch((err) => info(err));

/**
 * Request Logging Middleware
 * 
 * Log all incoming HTTP requests for debugging and monitoring purposes.
 * This helps track API usage and troubleshoot issues in development.
 */
app.use(requestLogger);

/**
 * Test Environment Routes
 * 
 * Conditionally add testing routes only in test environment.
 * These routes are used for test database cleanup and setup.
 */
if (process.env.NODE_ENV === "test") {
  app.use("/api/testing", testingRouter);
}

/**
 * Health Check Endpoints
 * 
 * Provide endpoints for monitoring service health and status.
 * Used by Docker health checks and load balancers.
 * 
 * Routes:
 * - GET / : Basic server status
 * - GET /api/ping : Detailed health information with timestamp
 */
app.get("/",(req,res)=>{res.send("Server is running")});
app.get("/api/ping", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

/**
 * API Route Registration
 * 
 * Register all API routes with their respective controllers.
 * Each controller handles a specific domain of the application.
 * 
 * Routes:
 * - /api/login : User authentication and JWT token generation
 * - /api/users : User registration and profile management
 * - /api/blogs : Blog CRUD operations (Create, Read, Update, Delete)
 */
app.use("/api/login", loginController);
app.use("/api/users", userController);
app.use("/api/blogs", blogsController);

/**
 * Error Handling Middleware
 * 
 * Handle unknown endpoints and application errors.
 * Must be registered after all routes to catch unmatched requests.
 * 
 * Middleware order:
 * 1. unknownEndpoint: Handle 404 errors for unmatched routes
 * 2. errorHandler: Handle application errors and validation errors
 */
app.use(unknownEndpoint);

app.use(errorHandler);

// Export the configured Express application
module.exports = app;
