'use strict';
const express = require('express');
const router = express.Router();

const {BlogPost, Author} = require('./models');


// when the root of this router is called with GET, return
// all current ShoppingList items
router.get('/', (req, res) => {
  BlogPost
  .find()
  .then(blogs => {
    res.json({
      blogs: blogs.map(blog => blog.serialize())
    })
  })
  .catch(err => {
    console.error("error ", err);
    res.status(500).send("could not retrieve blogs")
  });
});



module.exports = {router};



