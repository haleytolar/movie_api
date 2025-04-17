/**
 * @fileOverview The myFlix API provides endpoints for managing users, movies, and user favorites.
 * @module myFlixAPI
 * @requires express
 * @requires mongoose
 * @requires passport
 * @requires express-validator
 * @requires body-parser
 * @requires cors
 * @requires morgan
 * @requires fs
 * @requires path
 */

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

require('dotenv').config();


// Add validator 
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');

// Connect to database
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://mflixxx.netlify.app', 'http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

const auth = require('./auth.js');
auth(app); // Call the function to set up the routes

const passport = require('passport');
app.use(passport.initialize());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));  // Enable morgan logging to 'log.txt'

/**
 * GET: Returns a welcome message.
 * @name WelcomeMessage
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {string} Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome movie enthusiasts!');
});

/**
 * POST: Creates a new user.
 * @name CreateUser
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} JSON object with user information
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
        .then((user) => {
          res.status(201).json(user);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
  }
);

/**
 * GET: Returns a list of all users.
 * @name GetAllUsers
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Array} List of users
 */
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * GET: Returns a user by username.
 * @name GetUserByUsername
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} User information
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * PUT: Updates a user's information.
 * @name UpdateUser
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Updated user information
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * DELETE: Deletes a user by username.
 * @name DeleteUser
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {string} Success or error message
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
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
      res.status(500).send('Error: ' + err);
    });
});

/**
 * POST: Adds a movie to a user's list of favorites.
 * @name AddFavoriteMovie
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Updated user information
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * DELETE: Removes a movie from a user's list of favorites.
 * @name RemoveFavoriteMovie
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Updated user information
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * GET: Returns a list of all movies.
 * @name GetAllMovies
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Array} List of movies
 */
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a single movie by title.
 * @name GetMovieByTitle
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Movie data
 */
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a genre by name.
 * @name GetGenreByName
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Genre data
 */
app.get('/movies/genres/:genreName', async (req, res) => {
  await Movies.find({ 'Genre.Name': req.params.genreName })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data about a director by name.
 * @name GetDirectorByName
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Director data
 */
app.get('/movies/directors/:directorName', async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Error handler middleware.
 * @function
 * @memberof module:myFlixAPI
 * @param {Object} err - Error object
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
