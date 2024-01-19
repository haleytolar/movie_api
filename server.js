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

//connect to db
mongoose.connect('mongodb://localhost:27017/test');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
//make public folder serve static files
app.use(express.static('public'));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'}) //enable logging requests
app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

app.get('/', (req, res) => {
    res.send('Welcome movie enthusiasts!')
});


//create new user
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users', async (req, res) => {
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
app.get('/users/:Username', async (req, res) => {
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
app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }) //makes sure that updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
  
  });

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
  try {
      const user = await Users.findOneAndDelete({ Username: req.params.Username });

      if (!user) {
          return res.status(400).send(req.params.Username + ' was not found');
      } else {
          return res.status(200).send(req.params.Username + ' was deleted.');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});


// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  try {
      const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $push: { FavoriteMovies: req.params.MovieID } },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).send("Error: User not found");
      }

      return res.json(updatedUser);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});


//lets user delete movie from favorite
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  try {
      const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $pull: { FavoriteMovies: req.params.MovieID } },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).send("Error: User doesn't exist");
      } else {
          return res.json(updatedUser);
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});



// search all movies
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}
);

// search by title
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// search by genre
app.get('/movies/genres/:genreName', (req, res) => {
  Movies.find({ 'Genre.Name': req.params.genreName })
      .then((movies) => {
          res.status(200).json(movies);
      })
      .catch((err) => {
          res.status(500).send('Error: ' + err);
      });
});

// search by director
app.get('/movies/directors/:directorName', (req, res) => {
  Movies.find({ 'Director.Name': req.params.directorName })
  .then((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    res.status(500).send('Error: ' + err);
  });
}
);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
