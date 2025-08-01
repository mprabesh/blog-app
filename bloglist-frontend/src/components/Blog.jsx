import { useState } from "react";

/**
 * Blog Component
 *
 * Displays individual blog post information with expandable details and interactive features.
 * This component handles the display of blog posts in both collapsed and expanded states.
 *
 * Features:
 * - Modern card-based design with hover effects
 * - Toggleable view between summary (title/author) and detailed view
 * - Like functionality with real-time like count updates
 * - Delete functionality for blog owners only
 * - Responsive design with professional styling
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
  const [isLiking, setIsLiking] = useState(false);
  
  const currUser = JSON.parse(localStorage.getItem("userData")).username;
  const isOwner = blog.user?.username === currUser;

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await handleLikesUpdate(blog);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="blog-card animate-slideUp">
      <div className="blog-card-header">
        <div className="flex-1">
          <h3 className="blog-title">{blog.title}</h3>
          <div className="blog-author">
            <span>by {blog.author}</span>
          </div>
        </div>
        <div className="blog-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setView(!view)}
            aria-label={view ? "Hide details" : "Show details"}
          >
            {view ? "Hide" : "Details"}
          </button>
        </div>
      </div>
      
      {view && (
        <div className="blog-details animate-fadeIn">
          {blog.url && (
            <a 
              href={blog.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="blog-url"
            >
              🔗 {blog.url}
            </a>
          )}
          
          <div className="blog-stats">
            <div className="blog-likes">
              <span>{blog.likes} {blog.likes === 1 ? 'like' : 'likes'}</span>
            </div>
            {blog.user && (
              <div className="blog-user">
                <div className="user-avatar" style={{width: '20px', height: '20px', fontSize: '0.75rem'}}>
                  {blog.user.name?.charAt(0).toUpperCase() || blog.user.username?.charAt(0).toUpperCase()}
                </div>
                <span>{blog.user.name || blog.user.username}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              className={`btn btn-success btn-sm ${isLiking ? 'opacity-50' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              {isLiking ? '❤️ Liking...' : '❤️ Like'}
            </button>
            
            {isOwner && (
              <button 
                id="remove-btn"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
                    handleDelete(blog);
                  }
                }}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default Blog;
