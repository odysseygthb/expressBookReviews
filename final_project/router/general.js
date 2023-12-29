const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios').default;


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json("User registered");
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

async function getUsers() {
    const users = await axios.get("https://prystupkoboh-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/");
    return users;
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

async function getCorrectBookByIsbn(isbn) {
    const correctBook = await axios.get(`https://prystupkoboh-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/isbn/${isbn}`);
    return correctBook;
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  function findBookByISBN(isbn, bookList) {
    for (const key in bookList) {
        const book = bookList[key];
        if (book.isbn.toString() === isbn.toString()) {
            return book;
        }
    }
    return null;
   }
  const correctBook = findBookByISBN(isbn, books);
  if (!correctBook) {
    return res.status(404).send("There is no book with this isbn"); 
  }
  return res.status(200).json(correctBook);
 });

 async function getCorrectBookByAuthor(author) {
    const correctBook = await axios.get(`https://prystupkoboh-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/author/${author}`);
    return correctBook;
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    function findBookByAuthor(author, bookList) {
        const bookArray = Object.keys(bookList).map(key => {
            return bookList[key]
        });
        const filteredBooks = bookArray.filter(b => {
            return b.author.toString() === author.toString()
        });
        
        if (filteredBooks.length < 1) {
            return null;
        } 
        return filteredBooks;
     }
    const correctBook = findBookByAuthor(author, books);
    if (!correctBook) {
      return res.status(404).send("There is no book with this author"); 
    }
    return res.status(200).json(correctBook);
});

async function getCorrectBookByTitle(title) {
    const correctBook = await axios.get(`https://prystupkoboh-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title/${title}`);
    return correctBook;
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    function findBookByTitle(title, bookList) {
      for (const key in bookList) {
          const book = bookList[key];
          if (book.title.toString() === title.toString()) {
              return book;
          }
      }
      return null;
     }
    const correctBook = findBookByTitle(title, books);
    if (!correctBook) {
      return res.status(404).send("There is no book with this title"); 
    }
    return res.status(200).json(correctBook);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    function findBookReviewByIsbn(isbn, bookList) {
      for (const key in bookList) {
          const book = bookList[key];
          if (book.isbn.toString() === isbn.toString()) {
              return book.reviews;
          }
      }
      return null;
     }
    const correctBook = findBookReviewByIsbn(isbn, books);
    if (!correctBook) {
      return res.status(404).send("There is no book with this isbn"); 
    }
    return res.status(200).json(correctBook);
});

module.exports.general = public_users;
