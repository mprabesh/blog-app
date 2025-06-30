import { useState } from "react";

/**
 * Blog Component
 *
 * Displays individual blog post information with expandable details and interactive features.
 * This component handles the display of blog posts in both collapsed and expanded states.
 *
 * Features:
 * - Toggleable view between summary (title/author) and detailed view
 * - Like functionality with real-time like count updates
 * - Delete functionality for blog owners only
 * - Responsive design with inline styling
 * - User authorization checks for delete operations
 *
 * Props:
 * @param {Object} blog - Blog object containing title, author, url, likes, user info
 * @param {Function} handleLikesUpdate - Callback function to update blog likes
 * @param {Function} handleDelete - Callback function to delete blog post
 *
 * State:
 * @param {boolean} view - Controls whether detailed view is shown or hidden
 */

const Blog = ({ blog, handleLikesUpdate, handleDelete }) => {
  const [view, setView] = useState(false);
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };
  const currUser = JSON.parse(localStorage.getItem("userData")).username;
  return (
    <div style={blogStyle} className="a_blog">
      {blog.title} {blog.author}
      <button className="view-btn" onClick={() => setView(!view)}>
        {view ? "hide" : "view"}
      </button>
      <br />
      {view ? (
        <div className="blog-info">
          {blog.url}
          <br />
          likes {blog.likes}{" "}
          <button className="like-btn" onClick={() => handleLikesUpdate(blog)}>
            like
          </button>
          <br />
          {blog.user.name}
          <br />
          {blog.user.username === currUser ? (
            <button id="remove-btn" onClick={() => handleDelete(blog)}>
              remove
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Blog;
