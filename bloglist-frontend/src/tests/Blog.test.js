import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // Correct import
import Blog from "../components/Blog";
import AddBlogForm from "../components/AddBlogForm";

const blog = {
  id: 12345,
  title: "7 wonders of the world",
  author: "Alex Romanov",
  url: "https://worldheritage.com/",
  likes: 99,
  user: { name: "Prabesh Magar" },
};

describe("Blog App tests", () => {
  // Mocking localStorage for tests
beforeEach(() => {
  const userData = { username: "testUser" };
  jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
    if (key === "userData") {
      return JSON.stringify(userData);
    }
    return null;
  });
});

afterEach(() => {
  // Clear the mock after each test to avoid interference
  jest.restoreAllMocks();
});

  test("component displaying a blog renders the blog's title and author, but does not render its URL or number of likes by default", () => {
    const { container } = render(<Blog blog={blog} />);
    const div = container.querySelector(".a_blog");
    expect(div).toHaveTextContent("7 wonders of the world");
    expect(screen.queryByText("likes")).toBeNull();
    expect(screen.queryByText("url")).toBeNull();
  });

  test("the blog's URL and number of likes are shown when the button controlling the shown details has been clicked", async () => {
    const container = render(<Blog blog={blog} />).container;
    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);
    const div = container.querySelector(".a_blog");
    expect(div).toHaveTextContent("https://worldheritage.com/");
    expect(div).toHaveTextContent("99");
  });

  test("if the like button is clicked twice, the event handler the component received as props is called twice.", async () => {
    const mockFunction = jest.fn();
    render(<Blog blog={blog} handleLikesUpdate={mockFunction} />);
    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);
    const likeButton = screen.getByText("like");
    await user.click(likeButton);
    await user.click(likeButton);
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });
});

describe("<AddBlogForm />", () => {
  test("the form calls the event handler it received as props with the right details when a new blog is created.", async () => {
    const mockFunction = jest.fn();

    const component = render(<AddBlogForm createBlog={mockFunction} />);

    const title = component.container.querySelector("#title");
    const author = component.container.querySelector("#author");
    const url = component.container.querySelector("#url");
    const form = component.container.querySelector("form");

    fireEvent.change(title, { target: { value: "Testing Title" } });
    fireEvent.change(author, { target: { value: "Prabesh Magar" } });
    fireEvent.change(url, { target: { value: "http://www.gameforfun.com" } });

    fireEvent.submit(form);

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction.mock.calls[0][0].title).toBe("Testing Title");
    expect(mockFunction.mock.calls[0][0].author).toBe("Prabesh Magar");
    expect(mockFunction.mock.calls[0][0].url).toBe("http://www.gameforfun.com");
  });
});
