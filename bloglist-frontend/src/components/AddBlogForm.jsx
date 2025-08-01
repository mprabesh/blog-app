import { useState } from "react";

/**
 * AddBlogForm Component
 * 
 * Modern blog creation form with improved UX, validation, and styling.
 * Features proper form structure, validation, and responsive design.
 */

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: "", author: "", url: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setNewBlog({
      ...newBlog,
      [e.target.name]: e.target.value,
    });
  };

  const addBlog = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createBlog(newBlog);
      setNewBlog({ title: "", author: "", url: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = newBlog.title.trim() && newBlog.author.trim();

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-800">Create New Blog Post</h3>
        <p className="text-sm text-gray-600 mt-1">Share your thoughts with the community</p>
      </div>
      
      <div className="card-body">
        <form onSubmit={addBlog} className="space-y-4">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              value={newBlog.title}
              name="title"
              id="title"
              className="form-input"
              onChange={handleChange}
              placeholder="Enter an engaging title..."
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="author" className="form-label">
              Author *
            </label>
            <input
              value={newBlog.author}
              name="author"
              id="author"
              className="form-input"
              onChange={handleChange}
              placeholder="Your name..."
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="url" className="form-label">
              URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              value={newBlog.url}
              name="url"
              id="url"
              type="url"
              className="form-input"
              onChange={handleChange}
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a link to reference material or your personal website
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              id="submit-btn"
              className={`btn btn-primary btn-lg flex-1 ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? '📝 Creating...' : '📝 Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
