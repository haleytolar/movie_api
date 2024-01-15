//framework setup provides features
const express = require('express'),

//creates node_modules
  fs = require('fs'),

//log request
  morgan = require('morgan');

//creates file paths
  path = require('path');

//enable express thoughout app
const app = express();

//enable logging requests
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

//make public folder serve static files
app.use(express.static('public'));


let topTenMovies = [
    {
        title: 'The Godfather',
        Director: 'Francis Ford Coppola'
    },
    {
        title: 'The Lord of the Rings trilogy',
        Director: 'Peter Jackson'
    },
    {
        title: 'The Dark Knight',
        Director: 'Christopher Nolan'
    },
    {
        title: 'A Space Odyssey',
        Director: 'Stanley Kubrick'
    },
    {
        title: 'The Shawshank Redemption',
        Director: 'Frank Darabont'
    },
    {
        title: 'Pulp Fiction',
        Director: 'Quentin Tarantino'
    },
    {
        title: '12 Angry Men',
        Director: 'Sidney Lumet'
    },
    {
        title: 'Citizen Kane',
        Director: 'Orson Welles'
    },
    {
        title: 'Casablanca',
        Director: 'Michael Curtiz'
    },
    {
        title: 'Forrest Gump',
        Director: 'Robert Zemeckis'
    }
]

//app.get('/movies', (req, res) => {
  //res.json(topTenMovies);
//});

app.get('/', (req, res) => {
    res.send('Welcome movie enthusiasts!')
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
