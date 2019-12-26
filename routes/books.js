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
      res.status(500).send(error);
    }
  };
}

const urlParams = "?page=1&limit=5";
// get /books - Shows the full list of books.

// the commented sections inside are for pagination
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const reqPage = parseInt(req.query.page);
    const reqLimit = parseInt(req.query.limit);
    const startIndex = (reqPage - 1) * reqLimit;

    const books = await Book.findAll({
      order: [["title", "ASC"]],
      limit: reqLimit,
      offset: startIndex
    });

    const booksListed = books.length;

    res.render("books/index", {
      books,
      title: "Books",
      reqPage,
      reqLimit,
      booksListed
    });
  })
);

router.get(
  "/search/",
  asyncHandler(async (req, res) => {
    const { search } = req.query;

    const books = await Book.findAll({
      order: [["title", "ASC"]],
      where: {
        year: {
          [Op.like]: ['"%' + search + '%"']
        }
      }
    });

    const booksListed = books.length;

    res.render("books/index", {
      books,
      title: "Search: " + search,
      booksListed
    });
  })
);

// get /books/new - Shows the create new book form.
router.get("/new", (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book", urlParams });
});

// post /books/new - Posts a new book to the database.
router.post(
  "/",
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
        throw error; // error caught in the asyncHandler's catch block
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
      res.render("books", { book, title: book.title });
    } else {
      res.sendStatus(404);
    }
  })
);

router.get(
  "/:id/book_details",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", {
        book,
        title: "Book Details",
        urlParams
      });
    } else {
      res.sendStatus(404);
    }
  })
);

// post /books/:id - Updates book info in the database.
router.post(
  "/:id/book_details",
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
        throw error;
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
      res.sendStatus(404);
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
      res.sendStatus(404);
    }
  })
);

module.exports = router;
