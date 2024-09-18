import { useState } from "react";
const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: "", author: "", url: "" });

  const handleChange = (e) => {
    setNewBlog({
      ...newBlog,
      [e.target.name]: e.target.value,
    });
  };

  const addBlog = (event) => {
    event.preventDefault();
    createBlog(newBlog);
    setNewBlog({ title: "", author: "", url: "" });
  };

  return (
    <form onSubmit={addBlog}>
      <label htmlFor="title">Title: </label>
      <input
        value={newBlog.title}
        name="title"
        id="title"
        onChange={handleChange}
        placeholder="title..."
      />
      <br />
      <label htmlFor="author">Author: </label>
      <input
        value={newBlog.author}
        name="author"
        id="author"
        onChange={handleChange}
        placeholder="Author..."
      />
      <br />
      <label htmlFor="url">URL: </label>
      <input
        value={newBlog.url}
        name="url"
        id="url"
        onChange={handleChange}
        placeholder="url..."
      />
      <br />
      <button type="submit" id="submit-btn">
        Create
      </button>
    </form>
  );
};

export default BlogForm;
