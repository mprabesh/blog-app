/**
 * Main Blog Application Component
 * 
 * This is the root component of the React blog application that manages:
 * - User authentication state and login/logout functionality
 * - Blog posts state and CRUD operations
 * - Navigation between different views (login, blog list, create blog)
 * - Global notification system for user feedback
 * - Local storage management for persistent user sessions
 * 
 * Features:
 * - User registration and login with JWT authentication
 * - Blog creation, editing, and deletion
 * - Like/unlike functionality for blog posts
 * - Responsive design with toggleable forms
 * - Error handling with user-friendly notifications
 * - Persistent login state using localStorage
 */

import { useEffect, useState, useRef } from "react";
import Blog from "./components/Blog";
import BlogServices from "./services/blog";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import AddBlogForm from "./components/AddBlogForm";
import Notification from "./components/Notification";
import Toggleable from "./components/Toggleable";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setuser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userCredentials, setuserCredentials] = useState({
    username: "",
    password: "",
  });
  const [notificationMessage, setNotificationMessage] = useState({
    message: "",
    messageTypeError: false,
  });

  const blogFormRef = useRef();

  useEffect(() => {
    BlogServices.getAll()
      .then((result) => {
        setBlogs(result.data);
      })
      .catch((err) => {err});
    setuser(JSON.parse(window.localStorage.getItem("userData")));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    BlogServices.login(userCredentials)
      .then((result) => {
        setuser(result.data);
        window.localStorage.setItem("userData", JSON.stringify(result.data));
        setNotificationMessage({
          ...notificationMessage,
          message: "Welcome to blog app",
        });
        setTimeout(() => {
          setNotificationMessage({
            message: "",
            messageTypeError: false,
          });
        }, 3000);
        setuserCredentials({
          username: "",
          password: "",
        });
      })
      .catch((err) => {
        setNotificationMessage({
          message: err.response?.data?.error || err.message || "Network error occurred",
          messageTypeError: true,
        });
        setTimeout(() => {
          setNotificationMessage({
            message: "",
            messageTypeError: false,
          });
        }, 3000);
        setuserCredentials({
          username: "",
          password: "",
        });
      });
  };

  const handleRegister = async (userData) => {
    try {
      const result = await BlogServices.register(userData);
      
      // Show success message
      setNotificationMessage({
        message: `Account created successfully! Welcome ${result.data.name}!`,
        messageTypeError: false,
      });

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotificationMessage({
          message: "",
          messageTypeError: false,
        });
      }, 3000);

      // Switch to login form after successful registration
      setIsRegistering(false);
      
      // Pre-fill login form with registered username
      setuserCredentials({
        username: userData.username,
        password: "",
      });

    } catch (err) {
      console.error("Registration error:", err);
      setNotificationMessage({
        message: err.response?.data?.error || err.message || "Registration failed. Please try again.",
        messageTypeError: true,
      });

      setTimeout(() => {
        setNotificationMessage({
          message: "",
          messageTypeError: false,
        });
      }, 5000);
    }
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    setNotificationMessage({ message: "", messageTypeError: false });
  };

  const switchToLogin = () => {
    setIsRegistering(false);
    setNotificationMessage({ message: "", messageTypeError: false });
  };

  const createBlog = (newBlog) => {
    blogFormRef.current.toggleVisibility();
    BlogServices.addBlog(newBlog)
      .then((result) => {
        setBlogs([...blogs, result.data]);
        setNotificationMessage({
          ...notificationMessage,
          message: `a new blog ${result.data.title} by ${result.data.author} added.`,
        });
        setTimeout(() => {
          setNotificationMessage({
            message: "",
            messageTypeError: false,
          });
        }, 3000);
      })
      .catch((err) => {
        if (err.response?.data?.error === "jwt expired") {
          setuser(null);
          window.localStorage.removeItem("userData");
        }
        setNotificationMessage({
          messageTypeError: true,
          message: err.response?.data?.error || err.message || "Network error occurred",
        });
        setTimeout(() => {
          setNotificationMessage({
            message: "",
            messageTypeError: false,
          });
        }, 3000);
      });
  };

  const handleLikesUpdate = (blog) => {
    BlogServices.updateLike(blog.id, {
      ...blog,
      likes: blog.likes + 1,
      user: user.id,
    })
      .then((result) => {
        setBlogs(
          blogs.map((val) =>
            val.id === result.data.id
              ? { ...val, likes: result.data.likes + 1 }
              : val
          )
        );
      })
      .catch((err) => {
        if (err.response?.data?.error === "jwt expired") {
          setuser(null);
          window.localStorage.removeItem("userData");
        }
        setNotificationMessage({
          messageTypeError: true,
          message: err.response?.data?.error || err.message || "Network error occurred",
        });
        setTimeout(() => {
          setNotificationMessage({
            message: "",
            messageTypeError: false,
          });
        }, 3000);
      });
  };

  const handleDelete = (blog) => {
    const confirmDelete = window.confirm(
      `Remove blog ${blog.title} by ${blog.author}`
    );
    if (confirmDelete) {
      BlogServices.deleteBlog(blog.id)
        .then((result) => {
          setBlogs(blogs.filter((blog) => blog.id !== result.data.id));
          setNotificationMessage({
            ...notificationMessage,
            message: "Deletion successful",
          });
          setTimeout(() => {
            setNotificationMessage({
              message: "",
              messageTypeError: false,
            });
          }, 3000);
        })
        .catch((err) => {
          if (err.response?.data?.error === "jwt expired") {
            setuser(null);
            window.localStorage.removeItem("userData");
          }
          setNotificationMessage({
            messageTypeError: true,
            message: err.response?.data?.error || err.message || "Network error occurred",
          });
          setTimeout(() => {
            setNotificationMessage({
              message: "",
              messageTypeError: false,
            });
          }, 3000);
        });
    }
  };

  const logout = () => {
    setuser(null);
    window.localStorage.removeItem("userData");
  };

  return (
    <div className="app-container">
      {user === null ? (
        <div className="main-content">
          <div className="text-center mb-8">
            <h1 className="page-title">Welcome to BlogSpace</h1>
            <p className="page-subtitle">Share your thoughts with the world</p>
          </div>
          
          {isRegistering ? (
            <RegisterForm
              handleRegister={handleRegister}
              notificationMessage={notificationMessage}
              switchToLogin={switchToLogin}
            />
          ) : (
            <LoginForm
              handleLogin={handleLogin}
              userCredentials={userCredentials}
              setuserCredentials={setuserCredentials}
              notificationMessage={notificationMessage}
              switchToRegister={switchToRegister}
            />
          )}
        </div>
      ) : (
        <>
          <header className="app-header">
            <div className="header-content">
              <a href="#" className="app-logo">
                BlogSpace
              </a>
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span>Welcome, {user.name}</span>
                </div>
                <button 
                  id="logout-btn" 
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="main-content">
            <Notification notificationMessage={notificationMessage} />
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="section-title">Latest Blog Posts</h1>
                  <p className="text-gray-600">Discover amazing stories from our community</p>
                </div>
                <Toggleable buttonLabel="Create New Post" ref={blogFormRef}>
                  <AddBlogForm createBlog={createBlog} />
                </Toggleable>
              </div>

              <div className="blogs-grid">
                {blogs
                  .sort((val1, val2) => val2.likes - val1.likes)
                  .map((blog) => (
                    <Blog
                      key={blog.id}
                      blog={blog}
                      handleLikesUpdate={handleLikesUpdate}
                      handleDelete={handleDelete}
                    />
                  ))}
              </div>

              {blogs.length === 0 && (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No blogs yet</h3>
                  <p className="text-gray-500">Be the first to share your story!</p>
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
