const express = require('express');
const axios = require('axios');  // Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    users.push({
        username: username,
        password: password,
        reviews: {}
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: { username: username }
    });
});

public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:3000/books');

        return res.status(200).json({
            message: "List of available books",
            books: response.data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching book list",
            error: error.message
        });
    }
});

public_users.get('/books/promise', (req, res) => {
    axios.get('http://localhost:3000/books')
        .then(response => {
            res.status(200).json({
                message: "Books retrieved successfully",
                books: response.data
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Error retrieving books",
                error: error.message
            });
        });
});

public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:3000/books/${isbn}`);
        if (response.data) {
            return res.status(200).json({
                message: "Book found",
                book: response.data
            });
        } else {
            return res.status(404).json({
                message: "Book not found"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching book details",
            error: error.message
        });
    }
});

public_users.get('/books/promise/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    axios.get(`http://localhost:3000/books/${isbn}`)
        .then(response => {
            if (response.data) {
                res.status(200).json({
                    message: "Book found",
                    book: response.data
                });
            } else {
                res.status(404).json({
                    message: "Book not found"
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Error retrieving book",
                error: error.message
            });
        });
});

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const response = await axios.get(`http://localhost:3000/books/author/${author}`);
        if (response.data.length > 0) {
            return res.status(200).json({
                message: `Books by ${author} found`,
                books: response.data
            });
        } else {
            return res.status(404).json({
                message: `No books found by ${author}`
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by author",
            error: error.message
        });
    }
});

public_users.get('/books/promise/author/:author', (req, res) => {
    const author = req.params.author;

    axios.get(`http://localhost:3000/books/author/${author}`)
        .then(response => {
            if (response.data.length > 0) {
                res.status(200).json({
                    message: `Books by ${author} found`,
                    books: response.data
                });
            } else {
                res.status(404).json({
                    message: `No books found by ${author}`
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Error retrieving books by author",
                error: error.message
            });
        });
});

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const response = await axios.get(`http://localhost:3000/books/title/${title}`);
        if (response.data.length > 0) {
            return res.status(200).json({
                message: `Books with the title "${title}" found`,
                books: response.data
            });
        } else {
            return res.status(404).json({
                message: `No books found with the title "${title}"`
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by title",
            error: error.message
        });
    }
});

public_users.get('/books/promise/title/:title', (req, res) => {
    const title = req.params.title;

    axios.get(`http://localhost:3000/books/title/${title}`)
        .then(response => {
            if (response.data.length > 0) {
                res.status(200).json({
                    message: `Books with the title "${title}" found`,
                    books: response.data
                });
            } else {
                res.status(404).json({
                    message: `No books found with the title "${title}"`
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Error retrieving books by title",
                error: error.message
            });
        });
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        const reviews = books[isbn].reviews;

        if (Object.keys(reviews).length > 0) {
            return res.status(200).json({
                message: "Reviews found",
                reviews: reviews
            });
        } else {
            return res.status(200).json({
                message: "No reviews available for this book"
            });
        }
    } else {
        return res.status(404).json({
            message: "Book not found"
        });
    }
});

module.exports.general = public_users;