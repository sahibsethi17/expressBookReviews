const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const JWT_SECRET = "your_jwt_secret";

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
      const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: "Login successful", token: token });
  } else {
      return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
      const splitToken = token.split(' ')[1];
      const decoded = jwt.verify(splitToken, JWT_SECRET);
      const username = decoded.username;

      if (books[isbn]) {
          if (!books[isbn].reviews) {
              books[isbn].reviews = {};
          }
          books[isbn].reviews[username] = review;

          return res.status(200).json({
              message: "Review added/updated successfully",
              reviews: books[isbn].reviews
          });
      } else {
          return res.status(404).json({
              message: "Book not found"
          });
      }
  } catch (err) {
      console.log("JWT Verification Error:", err);
      return res.status(401).json({
          message: "Invalid token"
      });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(403).json({
          message: "Access denied. No token provided."
      });
  }

  try {
      const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
      const username = decoded.username;

      if (books[isbn]) {
          const reviews = books[isbn].reviews;

          if (reviews && reviews[username]) {
              delete reviews[username];

              return res.status(200).json({
                  message: "Your review has been deleted successfully",
                  reviews: books[isbn].reviews
              });
          } else {
              return res.status(404).json({
                  message: "You have no review to delete for this book"
              });
          }
      } else {
          return res.status(404).json({
              message: "Book not found"
          });
      }
  } catch (err) {
      return res.status(401).json({
          message: "Invalid token"
      });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;