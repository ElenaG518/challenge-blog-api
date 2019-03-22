'use strict';
const express = require('express');
const router = express.Router();

const {BlogPost} = require('./models');

// we're going to add some items to ShoppingList
// so there's some data to look at
// BlogPost.create("Blog 1", "blog 1", "me", "August 20th, 2018");
// BlogPost.create("Tomatoes", "blog 2", "you", "May 18th, 1940");
// BlogPost.create("Peppers", "blog 3", "they", "July 5th, 2013" );

// when the root of this router is called with GET, return
// all current ShoppingList items
router.get('/', (req, res) => {
  res.json(BlogPost.get());
});



module.exports = {router};



