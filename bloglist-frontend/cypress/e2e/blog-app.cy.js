describe("Blog app", function () {
  beforeEach(function () {
    cy.request("POST", "http://localhost:3003/api/testing/reset");
    const newUser = {
      username: "alex123",
      name: "Alex Ivanovich",
      password: "password",
    };
    cy.request("POST", "http://localhost:3003/api/users", newUser);
    cy.visit("http://localhost:5173");
  });

  it("Login form is shown", function () {
    cy.contains("login to application");
    cy.get("#login-btn");
  });

  describe("Login", function () {
    it("succeeds with correct credentials", function () {
      cy.get("#username").type("alex123");
      cy.get("#password").type("password");
      cy.get("#login-btn").click();
      cy.contains("Welcome to blog app");
      cy.contains("Alex Ivanovich logged in");
    });

    it("fails with wrong credentials", function () {
      cy.get("#username").type("alex123");
      cy.get("#password").type("wrong");
      cy.get("#login-btn").click();
      cy.get(".redClassMessage").should(
        "contain",
        "wrong username or password"
      );
      cy.get(".redClassMessage").should("have.css", "color", "rgb(255, 0, 0)");
      cy.get(".redClassMessage").should("have.css", "border-style", "solid");
    });

    describe("When logged in", function () {
      beforeEach(function () {
        cy.login({ username: "alex123", password: "password" });
      });
      it("able to logout",function(){
        cy.get("#logout-btn").should("exist");
        cy.get('#logout-btn').click();
        cy.url().should('include', '/');
      })

      it("add new blog", function () {
        cy.contains("add blog").click();
        cy.get("#author").type("Jasprit Sangha");
        cy.get("#title").type("Indian culture in the west");
        cy.get("#url").type("http://www.exchangeculture.com");
        cy.contains("Create").click();
        cy.get(".a_blog").should("contain", "Indian culture in the west");
      });

      it("users can like a blog", function () {
        cy.addBlog({
          author: "Jasprit Sangha",
          url: "http://www.exchangeculture.com",
          title: "Indian culture in the west",
          likes: 99,
        });
        cy.contains("view").click();
        cy.get(".blog-info").should("contain", 99);
        cy.contains("like").click();
        cy.get(".blog-info").should("contain", 100);
        cy.get(".blog-info");
      });

      it("owner of blog can delete", function () {
        cy.addBlog({
          author: "Sandeep Kumal",
          url: "http://www.techiemark.com",
          title: "14 IOT projects for fun",
          likes: 199,
        });
        cy.contains("view").click();
        cy.contains("remove").click();
        cy.get(".greenClassMessage").should("contain", "Deletion successful");
      });
      it("only owner can see delete button", function () {
        cy.addBlog({
          author: "Sandeep Kumal",
          url: "http://www.techiemark.com",
          title: "14 IOT projects for fun",
          likes: 199,
        });
        cy.contains("logout").click();
        const anotherUser = {
          username: "walker901",
          name: "Ronish Panta",
          password: "password",
        };
        cy.request("POST", "http://localhost:3003/api/users", anotherUser);
        cy.login({
          username: anotherUser.username,
          password: anotherUser.password,
        });
        cy.contains("view").click();
        cy.get("#remove-btn").should("not.exist");
      });
      describe(" blogs are ordered according to likes with the blog", function () {
        beforeEach(function () {
          const blog1 = {
            title: "test for sorting acc to likes",
            author: "Preston Kelly",
            url: "http://www.kwzjdjas.com",
            likes: 0,
          };
          const blog2 = {
            title: "most likes must be at top",
            author: "Mikela Kelly",
            url: "http://www.kwzjdjas.com",
            likes: 1,
          };
          const blog3 = {
            title: "last test of excercise",
            author: "Angelica Houston",
            url: "http://www.kwzjdjas.com",
          };
          cy.addBlog(blog1);
          cy.addBlog(blog2);
          cy.addBlog(blog3);
        });

        it("highest like blog at top", function () {
          cy.get(".view-btn").eq(2).click();
          cy.get(".like-btn").click().click();
          cy.get(".blog-div").eq(0).should("contain", "last test of excercise");
        });
      });
    });
  });

});


