const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPost} = require('./models');

// we're going to add some items to ShoppingList
// so there's some data to look at
BlogPost.create("Blog 1", "blog 1", "me", "August 20th, 2018");
BlogPost.create("Tomatoes", "blog 2", "you", "May 18th, 1940");
BlogPost.create("Peppers", "blog 3", "they", "July 5th, 2013" );

// when the root of this router is called with GET, return
// all current ShoppingList items
router.get('/', (req, res) => {
  res.json(BlogPost.get());
});

// when a new blog is posted, make sure it's
// got required fields ('name' and 'checked'). if not,
// log an error and return a 400 status code. if okay,
// add new item to ShoppingList and return it with a 201.
router.post('/', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPost.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
  res.status(201).json(item);
});

// when DELETE request comes in with an id in path,
// try to delete that item from ShoppingList.
router.delete('/:id', (req, res) => {
  BlogPost.delete(req.params.id);
  console.log(`Deleted blog item \`${req.params.id}\``);
  res.status(204).end();
});

// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `ShoppingList.update` with updated item.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog item \`${req.params.id}\``);
  const updatedItem = BlogPost.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(200).json(updatedItem);
})

module.exports = router;



