const express = require("express"); 
const app = express();
const fs = require('fs');
const morgan = require('morgan'); 
const path = require('path'); 
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

//add validater 
const { check, validationResult } = require('express-validator');

//connect to db
mongoose.connect('mongodb://localhost:27017/test');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
//make public folder serve static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

//let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

//app.use(cors({
  //origin: (origin, callback) => {
    //if(!origin) return callback(null, true);
   // if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
     // let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
     // return callback(new Error(message ), false);
   // }
   // return callback(null, true);
 // }
//}));

// Import auth.js
let auth = require('./auth.js')(app);

// Import passport and passport.js 
const passport = require('passport');
require('./passport.js');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'}) //enable logging requests
app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

app.get('/', (req, res) => {
    res.send('Welcome movie enthusiasts!')
});

const { check: validateCheck, validationResult: validateResult } = require('express-validator');

// ... Your existing code ...

// create new user
app.post('/users',
  // Validation logic here for request
  // you can either use a chain of methods like .not().isEmpty()
  // which means "opposite of isEmpty" in plain English "is not empty"
  // or use .isLength({min: 5}) which means
  // minimum value of 5 characters are only allowed
  [
    validateCheck('Username', 'Username is required').isLength({ min: 5 }),
    validateCheck('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    validateCheck('Password', 'Password is required').not().isEmpty(),
    validateCheck('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

    // check the validation object for errors
    const errors = validateResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          // If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  })




// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
      .then((users) => {
          res.status(201).json(users);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
      .then((user) => {
          res.json(user);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// update a user
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true } // makes sure that the updated document is returned
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Condition to check user authorization
  if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
  }
  // Condition ends here
  await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.Username + ' was not found');
          } else {
              res.status(200).send(req.params.Username + ' was deleted.');
          }
      })
      .catch((err) => {
          console.error(err);
          res.status.apply(500).send('Error: ' + err);
      });
});



// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
      // Condition to check user authorization
      if (req.user.Username !== req.params.Username) {
          return res.status(400).send('Permission denied');
      }

      // Update the user's favorite movies
      const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $push: { FavoriteMovies: req.params.MovieID } },
          { new: true } // This line makes sure that the updated document is returned
      );

      // Respond with the updated user
      res.json(updatedUser);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});



//lets user delete movie from favorite
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
      // Condition to check user authorization
      if (req.user.Username !== req.params.Username) {
          return res.status(400).send('Permission denied');
      }

      // Update the user's favorite movies by pulling the specified MovieID
      const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $pull: { FavoriteMovies: req.params.MovieID } },
          { new: true } // This line makes sure that the updated document is returned
      );

      // Respond with the updated user
      res.json(updatedUser);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});




// search all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// search by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
          res.json(movie);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// search by genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Using Mongoose to find movies with the specified genre
  await Movies.find({ 'Genre.Name': req.params.genreName })
      .then((movies) => {
          // Respond with a JSON array of movies
          res.status(200).json(movies);
      })
      .catch((err) => {
          // Handle any errors and send a 500 status with an error message
          res.status(500).send('Error: ' + err);
      });
});


// search by director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
          res.json(movie.Director);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

 // listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});