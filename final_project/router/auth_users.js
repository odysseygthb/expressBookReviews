const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("Succesfull login");
    } else {
      return res.status(208).json({message: "Invalid Login"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.username;
    function changeReviewByIsbn(isbn) {
      for (const key in books) {
          const book = books[key];
          if (book.isbn.toString() === isbn.toString()) {
            book.reviews = {username: review}
             return book;
          }
      }
      return null;
     }
    const correctBook = changeReviewByIsbn(isbn, books);
    if (!correctBook) {
        return res.status(404).send("There is no book with this isbn"); 
      }
      return res.status(200).json("You're succesfully added a review");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
    function deleteReviewByIsbn(isbn) {
      for (const key in books) {
          const book = books[key];
          if (book.isbn.toString() === isbn.toString()) {
            delete book.reviews[username];
            return book;
          }
      }
      return null;
     }
    const correctBook = deleteReviewByIsbn(isbn, books);
    if (!correctBook) {
        return res.status(404).send("There is no book with this isbn"); 
      }
      return res.status(200).json("You're succesfully deleted a review");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
