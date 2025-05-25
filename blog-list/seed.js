// Import required modules
const mongoose = require("mongoose");
const User = require("./models/user"); // Adjust path to your User model
const Blog = require("./models/blogs"); // Adjust path to your Blog model
const info = require("./utils/logger")
// MongoDB connection string
const MONGO_URL = "mongodb+srv://prabeshmagarrumsan:RcoScWDznHCMgmv6@cluster0.rbjux.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Adjust as necessary

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("MongoDB connection error:", err));

// Dummy data for seeding
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});

    console.log("Cleared existing data.");

    // Create dummy users
    const users = await User.insertMany([
      {
        username: "prabesh",
        name: "Prabesh Magar",
        passwordHash: "admin", // Replace with actual hashed password in production
      },
      {
        username: "rupinder",
        name: "Rupinder Kaur",
        passwordHash: "admin", // Replace with actual hashed password in production
      },
    ]);

    console.log("Inserted users:", users);

    // Create dummy blogs
    const blogs = await Blog.insertMany([
      {
        title: "First Blog",
        author: "John Doe",
        url: "https://example.com/first-blog",
        likes: 10,
        user: users[0]._id,
      },
      {
        title: "Second Blog",
        author: "Jane Doe",
        url: "https://example.com/second-blog",
        likes: 15,
        user: users[1]._id,
      },
      {
        title: "Another Blog by John",
        author: "John Doe",
        url: "https://example.com/another-blog",
        likes: 8,
        user: users[0]._id,
      },
    ]);

    console.log("Inserted blogs:", blogs);

    // Close the connection
    mongoose.connection.close();
    console.log("Database seeded and connection closed.");
  } catch (err) {
    console.log("Error seeding database:", err);
    mongoose.connection.close();
  }
};

// Run the seed script
seedData();