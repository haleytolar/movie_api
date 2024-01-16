const express = require('express'), //framework setup provides features
  fs = require('fs'), //creates node_modules
  morgan = require('morgan'); //log request
  path = require('path'); //creates file paths
  bodyParser = require('body-parser'), //parse JSON data
  uuid = require('uuid'), //creates user identification
  app = express(); //enable express thoughout app


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'}) //enable logging requests
app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

//make public folder serve static files
app.use(express.static('public'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome movie enthusiasts!')
});

let users = [
    {
        id: 1,
        name: "Bob",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Doug",
        favoriteMovies: ["The Godfather"]
    }
]


let movies = [
    {
        "Title":"The Godfather",
        "Descrition":"Don Vito Corleone, head of a mafia family, decides to hand over his empire to his youngest son Michael. However, his decision unintentionally puts the lives of his loved ones in grave danger.",
        "Genre": {
            "Name":"gangster",
            "Description":"A subgenre of crime, it focuses on gangs and organized misdemeanor.",
    },
        "Director": {
            "Name":"Francis Ford Coppola",
            "Bio":"Francis Ford Coppola is an American film director, producer and screenwriter. He is considered one of the leading figures of the New Hollywood film movement of the 1960s and 1970s and is widely considered one of the greatest directors of all time.",
            "Birth":"April 7, 1939",
    },
    "ImageURL":"https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ6EAZYpFPv-j-msWE7uFUueby2qiH_lz67ryBOJ41kg4nKHJ6y",
    "Featured": false
    },
    {
        "Title":"A Space Odyssey",
        "Descrition":"An imposing black structure provides a connection between the past and the future in this enigmatic adaptation of a short story by revered sci-fi author Arthur C. Clarke. When Dr. Dave Bowman (Keir Dullea) and other astronauts are sent on a mysterious mission, their ship's computer system, HAL, begins to display increasingly strange behavior, leading up to a tense showdown between man and machine that results in a mind-bending trek through space and time.",
        "Genre": {
            "Name":"Science fiction",
            "Description":"Science fiction is a genre of speculative fiction, which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.",
    },
        "Director": {
            "Name":"Stanley Kubrick",
            "Bio":"Stanley Kubrick was an American filmmaker and photographer. Widely considered one of the greatest filmmakers of all time, his films were nearly all adaptations of novels or short stories, spanning a number of genres and gaining recognition for their intense attention to detail, innovative cinematography, extensive set design, and dark humor.",
            "Birth":"July 26, 1928",
    },
    "ImageURL":"https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSvfAM066WHsduq5axPuWmdhXKYEEMjtSV8s14kAEQtXTufoQMo",
    "Featured": false
    },
    {
        "Title":"Casablanca",
        "Descrition":"Rick Blaine, who owns a nightclub in Casablanca, discovers his old flame Ilsa is in town with her husband, Victor Laszlo. Laszlo is a famed rebel, and with Germans on his tail, Ilsa knows Rick can help them get out of the country.",
        "Genre": {
            "Name":"romance",
            "Description":"A romance genre refers to a type of genre which places its primary focus on the relationship and romantic love between two people, and usually has an 'emotionally satisfying and optimistic ending.'",
    },
        "Director": {
            "Name":"Michael Curtiz",
            "Bio":"Michael Curtiz was a Hungarian-American film director, recognized as one of the most prolific directors in history. He directed classic films from the silent era and numerous others during Hollywood's Golden Age, when the studio system was prevalent.",
            "Birth":"December 24, 1886",
    },
    "ImageURL":"https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSxe_DEQcsxBKAzVSrss9lhl9ZW7QZ8MFDstcm5HZDrwBLBjR4t",
    "Featured": false
    },
]

//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }

})

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

  let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }

})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }

})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }

})

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

  let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }

})

// READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

// READ
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie')
    }
    
})

// READ
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
    
})

// READ
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director')
    }
    
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
