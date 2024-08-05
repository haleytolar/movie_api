const jwtSecret = "your_jwt_secret"; // this has to be the same key used in the JWTStrategy
const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); // your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // this is the username you’re encoding in the JWT
    expiresIn: "7d", // this specifies that the token will expire in 7 days
    algorithm: "HS256", // this is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */

module.exports = (router) => {
  router.post("/login", (req, res) => {
    console.log('Login route hit'); // Debugging log
    passport.authenticate(
      "local",
      { session: false },
      function callback(error, user) {
        if (error || !user) {
          console.log('Authentication failed'); // Debugging log
          return res.status(400).json({
            message: "Incorrect username or password",
            user: user
          });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            console.log('Login failed'); // Debugging log
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
      }
    )(req, res);
  });
};
