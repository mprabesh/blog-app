import { useEffect, useState, useRef } from "react";
import Blog from "./components/Blog";
import BlogServices from "./services/blog";
import LoginForm from "./components/LoginForm";
import AddBlogForm from "./components/AddBlogForm";
import Notification from "./components/Notification";
import Toggleable from "./components/Toggleable";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setuser] = useState(null);
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
          message: err.response.data.error,
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
        if (err.response.data.error === "jwt expired") {
          setuser(null);
          window.localStorage.removeItem("userData");
        }
        setNotificationMessage({
          messageTypeError: true,
          message: err.response.data.error,
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
        if (err.response.data.error === "jwt expired") {
          setuser(null);
          window.localStorage.removeItem("userData");
        }
        setNotificationMessage({
          messageTypeError: true,
          message: err.response.data.error,
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
          if (err.response.data.error === "jwt expired") {
            setuser(null);
            window.localStorage.removeItem("userData");
          }
          setNotificationMessage({
            messageTypeError: true,
            message: err.response.data.error,
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
    <div>
      {user === null ? (
        <LoginForm
          handleLogin={handleLogin}
          userCredentials={userCredentials}
          setuserCredentials={setuserCredentials}
          notificationMessage={notificationMessage}
        />
      ) : (
        <div>
          <h2>Blogs</h2>
          <Notification notificationMessage={notificationMessage} />
          {user.name} logged in <button id="logout-btn" onClick={logout}>logout</button>
          <Toggleable buttonLabel="add blog" ref={blogFormRef}>
            <AddBlogForm createBlog={createBlog} />
          </Toggleable>
          <div className="blog-div">
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
        </div>
      )}
    </div>
  );
};

export default App;
