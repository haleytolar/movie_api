/**
 * @fileOverview This module defines the Mongoose schemas for movies and users, and provides methods for password hashing and validation.
 * @module models
 * @requires bcrypt
 * @requires mongoose
 */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/**
 * Movie schema for storing movie details in the database.
 * @typedef {Object} MovieSchema
 * @property {string} Title - The title of the movie (required).
 * @property {string} Description - A brief description of the movie (required).
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - A brief biography of the director.
 * @property {Array.<string>} Actors - A list of actors in the movie.
 * @property {string} ImagePath - The path to the movie's image.
 * @property {boolean} Featured - Whether the movie is featured.
 */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * User schema for storing user details in the database.
 * @typedef {Object} UserSchema
 * @property {string} Username - The username of the user (required).
 * @property {string} Password - The hashed password of the user (required).
 * @property {string} Email - The email address of the user (required).
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array.<mongoose.ObjectId>} FavoriteMovies - A list of the user's favorite movies.
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a password before storing it in the database.
 * @function
 * @name hashPassword
 * @memberof module:models~UserSchema
 * @param {string} password - The plain text password to be hashed.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validates a user's password by comparing it with the hashed password stored in the database.
 * @function
 * @name validatePassword
 * @memberof module:models~UserSchema
 * @param {string} password - The plain text password to be validated.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

/**
 * The Movie model based on the MovieSchema.
 * @typedef {mongoose.Model} Movie
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * The User model based on the UserSchema.
 * @typedef {mongoose.Model} User
 */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
