const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      console.error(error);
      res.status(500).render("500", {
        status: "500",
        errorMessage: "There has been an Error"
      });
    }
  };
}

const urlParams = "?page=1&limit=12";

// get /books - Shows the full list of books.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    let reqPage = parseInt(req.query.page);
    let reqLimit = parseInt(req.query.limit);
    reqPage = Math.max(1, reqPage ? reqPage : 1);
    reqLimit = reqLimit ? reqLimit : 12;
    const startIndex = (reqPage - 1) * reqLimit;

    const books = await Book.findAndCountAll({
      order: [["title", "ASC"]],
      limit: reqLimit,
      offset: startIndex
    });

    const pages = Math.ceil(books.count / reqLimit);
    reqPage = Math.max(1, Math.min(reqPage, pages));

    res.render("books/index", {
      books,
      title: "Books",
      reqPage,
      reqLimit,
      pages,
      urlParams
    });
  })
);

router.get(
  "/search/",
  asyncHandler(async (req, res) => {
    let reqPage = parseInt(req.query.page);
    let reqLimit = parseInt(req.query.limit);
    reqPage = reqPage ? reqPage : 1;
    reqLimit = reqLimit ? reqLimit : 12;
    const startIndex = (reqPage - 1) * reqLimit;
    const { search } = req.query;

    reqPage = reqPage == NaN ? 1 : reqPage;
    reqLimit = reqLimit == NaN ? 12 : reqLimit;

    const books = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: "%" + search + "%"
            }
          },
          {
            author: {
              [Op.like]: "%" + search + "%"
            }
          },
          {
            genre: {
              [Op.like]: "%" + search + "%"
            }
          },
          {
            year: {
              [Op.like]: "%" + search + "%"
            }
          }
        ]
      },
      order: [["title", "ASC"]],
      limit: reqLimit,
      offset: startIndex
    });

    const pages = Math.ceil(books.count / reqLimit);
    reqPage = Math.max(1, Math.min(reqPage, pages));
    res.render("books/index", {
      books,
      title: "Search: " + search,
      reqPage,
      reqLimit,
      pages,
      urlParams,
      search
    });
  })
);

// get /books/new - Shows the create new book form.
router.get("/new", (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book", urlParams });
});

// post /books/new - Posts a new book to the database.
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + urlParams);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
          urlParams
        });
      } else {
        res.status(404).render("404", {
          status: 404,
          statusMessage: "Page Not Found",
          errorMessage: "We were unable to find what you were looking for!"
        }); // error caught in the asyncHandler's catch block
      }
    }
  })
);

// get /books/:id - Shows book detail form.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", {
        book,
        title: "Book Details",
        urlParams
      });
    } else {
      res.status(404).render("404", {
        status: 404,
        statusMessage: "Book Not Found",
        errorMessage: "We were unable to find the book you were looking for!"
      });
    }
  })
);

// post /books/:id - Updates book info in the database.
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books/" + urlParams);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct book gets updated
        res.render("books/update-book", {
          book,
          errors: error.errors,
          title: "Book Details"
        });
      } else {
        res.status(500).render("500", {
          status: 500,
          errorMessage: "We were unable to process your request!"
        });
      }
    }
  })
);

/* Delete article form. */
router.get(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/delete", { book, title: "Delete Book", urlParams });
    } else {
      res.status(404).render("404", {
        status: 404,
        statusMessage: "Book Not Found",
        errorMessage:
          "We were unable to find the book you were looking to delete!"
      });
    }
  })
);

// post /books/:id/delete - Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting.
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books/" + urlParams);
    } else {
      res.status(404).render("404", {
        status: 404,
        statusMessage: "Book Not Found",
        errorMessage:
          "We were unable to find the book you were looking to delete!"
      });
    }
  })
);

module.exports = router;
