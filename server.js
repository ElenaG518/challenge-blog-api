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
// const { Author, BlogPost } = require("./models");

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
const {router: authorRouter} = require('./authorRouter');
app.use('/author', authorRouter);

const {router: blogPostRouter} = require('./blogPostRouter');
app.use('/blogs', blogPostRouter);

// 
// app.delete("/authors/:id", (req, res) => {
//   BlogPost
//     .remove({author: req.params.id})
//     .then(() => {
//       Author
//       .findByIdAndRemove(req.params.id)
//       .then(() => res.status(204).json({message: "Success"}))
//     })  
//     .catch(err => res.status(500).json({message: "Internal server error"}));
// });    

// app.get("/posts", (req, res) => {
//   // res.sendFile(__dirname + '/views/index.html');
//   BlogPost
//     .find()
//   // success callback: for each restaurant we got back, we'll
//     // call the `.serialize` instance method we've created in
//     // models.js in order to only expose the data we want the API return.    
//     .then(blogs => {
//           res.json({
//           blogs: blogs.map(blog => blog.serialize())
//           })
//     })  
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ message: "didn't find posts Internal server error" });
//     });
// });



// // can also request by ID
// app.get("/posts/:id", (req, res) => {
//   BlogPost
//     // this is a convenience method Mongoose provides for searching
//     // by the object _id property
//     .findById(req.params.id)
//     .then(post => {
//       res.json(post.serialize())
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ message: "Internal server error" });
//     });
// });

// app.post("/posts", (req, res) => {
//   const requiredFields = ["title", "content", "author_id"];
//   for (let i = 0; i < requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`;
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   };

//   Author.findById(req.body.author_id)
//     .then(author => {
//       if (author) {
//         console.log(author);
//         console.log(req.body.author_id);

//         BlogPost
//         .create({
//           title: req.body.title,
//           content: req.body.content,
//           author: author
//         })
//         .then( blog => res.status(201).json(blog.serialize()))
//         .catch(err => {
//           console.error(err);
//           res.status(500).json({ message: "Internal server error" });
//         });
//       }
//       else { 
//         const message = "Author not found";
//         console.error(message);
//         res.status(400).send(message);
//       }
//      }) 
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ message: "Internal server error" });
//     });
//   });



// app.put("/posts/:id", (req, res) => {
//   // ensure that the id in the request path and the one in request body match
//   if (!(  (req.params.id) &&  (req.body.id) && (req.params.id === req.body.id) ) ) {
//     const message =
//       `Request path id (${req.params.id}) and request body id ` +
//       `(${req.body.id}) must match`;
//     console.error(message);
//     return res.status(400).json({ message: message });
//   }

//   // we only support a subset of fields being updateable.
//   // if the user sent over any of the updatableFields, we udpate those values
//   // in document
//   const toUpdate = {};
//   const updateableFields = ["title", "content" ];

//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       toUpdate[field] = req.body[field];
//     }
//   });

//   BlogPost
//     // all key/value pairs in toUpdate will be updated -- that's what `$set` does

//     .findByIdAndUpdate(req.params.id, { $set: toUpdate })
//     .then(blog =>  res.status(204).end())
//     .catch(err => res.status(500).json({ message: "Internal server error" }));
// });




// app.delete("/posts/:id", (req, res) => {
//   BlogPost.findByIdAndRemove(req.params.id)
//     .then(blog => res.status(204).end())
//     .catch(err => res.status(500).json({ message: "Internal server error" }));
// });

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
