"use strict";

const express = require("express");
const morgan = require('morgan');
const mongoose = require("mongoose");

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;


// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("./config");
const { Author, BlogPost } = require("./models");

const app = express();
app.use(morgan('common'));
// replaces bodyParser and used on all app uses
app.use(express.json());

// import the router for each route
// direct app to correct route depending on path

// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
// const {router: authorRouter} = require('./authorRouter');
// app.use('/author', authorRouter);

// const {router: blogPostRouter} = require('./blogPostRouter');
// app.use('/blogs', blogPostRouter);

app.get('/authors', (req, res) => {
  Author
  // this call returns a promise
  .find()
  // if successful
  .then(authors => {
      // send response as an object with key authors and value as array of authors
      res.json({  
      authors: authors.map(author => author.serialize()) 
      })
  })
  // if failed
  .catch(err => {
      console.error(err);
      res.status(500).json({message: "Something went wrong"})
  });
});

// author get by id
app.get('/authors/:id', (req, res) => {
  Author
  .findById(req.params.id)
  .then(author => {
      res.json(author.serialize());
  })
  .catch(err => {
      console.error(err);
      res.status(500).json({message: "Something went wrong"})
  });
});

// author post a new author
app.post('/authors', (req, res) => {
  // make sure all required fields have values
  const requiredFields = ["firstName", "lastName", "userName"];
  requiredFields.forEach(field => {
      if (!field == req.body) {
          const message = `${field} is missing in req body`;
          console.error(message);
          res.status(500).json({message})
      }
  });

  // make sure the username is not already taken
  const {firstName, lastName, userName} = req.body;

 Author
 .findOne({userName})
 .then(author => {
          if (author) {
              const message = "That username is already taken";
              res.status(400).json({message});
          } else {
              const newAuthor = {
                  firstName,
                  lastName,
                  userName
          };

          Author
          .create(newAuthor)
          .then(author => {
              res.status(201).json(author.serialize())
          })
          .catch(err => {
              const message = "Something went wrong";
              res.stat(500).json({message});
          })
      }
  })
  .catch(err => {
  const message = "Something went wrong";
  res.stat(500).json({message});
  });
});

app.put('/authors/:id', (req, res) => {
  //make sure req.params.id and req.body.id are valid and that they match
  if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
      console.log(`params: ${req.params.id} and  body: ${req.body.id}`);
      const message = `${req.params.id} and ${req.body.id} don't match`;
      console.error(message);
      res.status(400).send(message);
  } else {
      // make sure the updatable fields are reinitialized with the new values

      const updatedItem = {};
      const updateableFields = ["firstName", "lastName", "username"];

      //   updateableFields.forEach(field => {
      //     if (field in req.body) {
      //       toUpdate[field] = req.body[field];
      //     }
      //   });

      const bodyKeys = Object.keys(req.body);
      
      updateableFields.forEach(field => {           
          bodyKeys.forEach(key => {
              console.log("field ", field, "key ", key);
              if (field == key) {
                  // field must be in brackets because it is a string
                  console.log("in here ", req.body[key]);
                  updatedItem[field] = req.body[key]; 
              }    
          })
      })    
      console.log("update ", updatedItem);

      // check to make sure username is not already taken
      Author
      .findOne({userName: req.body.userName})
      .then(author => {
          if (author) {
              res.status(400).json({message: "That username is already taken"});
          } else {
              // get the author with the same id as params.body.id
              Author
              // all key/value pairs in toUpdate will be updated -- that's what `$set` does
              // { new: true } - if you are asking to return the new value
              .findOneAndUpdate({_id: req.params.id}, {$set: updatedItem}, { new: true })
              .then(updatedAuthor => {
                  res.status(202).json(updatedAuthor.serialize());
              })
          }
      })
      .catch(err => {
          res.status(500).send("Something went wrong in .findOne")
      });
  }       
});
 
app.delete("/authors/:id", (req, res) => {
  BlogPost
  // first remove all posts for that author
    .remove({author: req.params.id})
    .then(() => {
      // then remove teh author
      Author
      .findByIdAndRemove(req.params.id)
      .then(() => {
        console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
        res.status(204).json({message: "Success"})
      })
      .catch(err => res.status(500).json({message: "could not delete author document"}));
    })  
    .catch(err => res.status(500).json({message: "Could not delete author's blogposts"}));
});    

app.get("/posts", (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json({
        posts: posts.map(post => post.serialize())
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



// can also request by ID
app.get("/posts/:id", (req, res) => {
  BlogPost
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(post => {

      res.json(post.serialize())
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/posts", (req, res) => {
  const requiredFields = ["title", "content", "author_id"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }) 

  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
                
        BlogPost
        .create({
          title: req.body.title,
          content: req.body.content,
          author: author
        })
        .then( blog => res.status(201).json(blog.serialize()))
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        });
      }
      else { 
        const message = "Author not found";
        console.error(message);
        res.status(400).send(message);
      }
     }) 
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
  });

  app.put("/posts/comments/:id", (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id &&  req.body.id && req.params.id === req.body.id ) ) {
      const message =
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`;
      console.error(message);
      return res.status(400).json({ message: message });
    }

    const newComment = req.body.comments;
    console.log("new Comment ", newComment);
    const toUpdate = {};
    
    BlogPost
    .findById(req.params.id)
    .then(blog => {
      if(blog) {
        const { comments } = blog;
        
        console.log("before pushing ", comments);
        comments.push(newComment);
        console.log("after pushing: ", comments);
        
        toUpdate["comments"]= comments;
        console.log("update ", toUpdate);

        BlogPost
        .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
        .then(blog => res.status(202).json(blog.serialize()))
        .catch(err => res.status(500).json({ message: err }))
      } else { 
        const message = "Blog not found";
        console.error(message);
        res.status(400).send(message);
      }
    })
    .catch(err => res.status(500).json({ message: `could not find blog with id ${req.params.id}`}))
  })
    
app.put("/posts/:id", (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id &&  req.body.id && req.params.id === req.body.id ) ) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
      const updateableFields = ["title", "content" ];

    updateableFields.forEach(field => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });
  
  BlogPost
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does

    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(() => {
        BlogPost
        .findById(req.params.id)
        .then(blog => res.status(202).json(blog.serialize()))
        .catch(err => res.status(500).send("Could not retrieve updated item"))
    })  
    .catch(err => res.status(500).json({ message: "Internal server error" }));
})    


app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.id}\``);
      res.status(204).end();
    });
});


// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});


// when requests come into `/blog` or
// we'll route them to the express
// router instances we've imported. Remember,
// these router instances act as modular, mini-express apps.
// app.use('/blogs', blogPostRouter);

// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
// if (!(port)) {
  // port= PORT;
// }

  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      { useNewUrlParser: true },

      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }


    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
