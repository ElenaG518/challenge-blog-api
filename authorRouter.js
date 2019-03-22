'use strict';
const express = require('express');
const router = express.Router();

// destructuring and importing as an object
const { Author } = require("./models");

router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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
router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
    // first delete all blogs by the author to be removed
    Author
    .findByIdAndDelete({_id: req.params.id})
    .then(() => {
        res.status(202).send("Author has been deleted")
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("could not delete author")
    });
})


module.exports = {router};