/**
 * @fileOverview This file configures the authentication strategies for the application using Passport.js.
 * It includes both the LocalStrategy for username/password authentication and the JWTStrategy for verifying JWT tokens.
 * @module passportConfig
 * @requires passport
 * @requires passport-local
 * @requires passport-jwt
 * @requires models
 */

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Configures Passport to use the LocalStrategy for username/password authentication.
 * This strategy is used to authenticate users based on their username and password.
 * 
 * @name LocalStrategy
 * @function
 * @memberof module:passportConfig
 * @param {Object} options - Options to customize the LocalStrategy.
 * @param {string} options.usernameField - The field name for the username in the request.
 * @param {string} options.passwordField - The field name for the password in the request.
 * @param {function} callback - The callback function to execute after the user is authenticated.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(`Login attempt: ${username} ${password}`); // Log the login attempt
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log('incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
          }
          console.log('Login successful');
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return callback(error);
          }
        });
    }
  )
);

/**
 * Configures Passport to use the JWTStrategy for authenticating users based on a JWT token.
 * This strategy is used to authenticate users by verifying a JWT token that was issued during login.
 * 
 * @name JWTStrategy
 * @function
 * @memberof module:passportConfig
 * @param {Object} options - Options to customize the JWTStrategy.
 * @param {function} callback - The callback function to execute after the JWT is verified.
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
