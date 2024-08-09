# Movie API

This is a RESTful API for managing a movie database. The Movie API allows users to register, log in, and interact with a collection of movies. Users can view details about movies, add them to their favorites, and more.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register and log in users securely.
- **Movie Database**: Browse, search, and retrieve detailed information about movies.
- **Favorite Movies**: Users can add and remove movies from their list of favorites.
- **Data Persistence**: Uses a database to store user and movie data.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and movie data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: Used for securing user authentication.
- **Passport.js**: Authentication middleware for Node.js.

## Installation

To run the Movie API locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/movie-api.git
    cd movie-api
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following:

    ```env
    PORT=your_port_number
    DB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4. **Start the server:**

    ```bash
    npm start
    ```

    The API will be available at `http://localhost:your_port_number`.

## Usage

Once the server is running, you can interact with the API using tools like Postman or cURL. Below are some of the main endpoints available.

## Endpoints

### Users

- **Register a new user:**

    - `POST /users`
    - Request Body:
        ```json
        {
          "Username": "username",
          "Password": "password",
          "Email": "email@example.com",
          "Birthday": "YYYY-MM-DD"
        }
        ```

- **Log in a user:**

    - `POST /login`
    - Request Body:
        ```json
        {
          "Username": "username",
          "Password": "password"
        }
        ```

- **Get user profile:**

    - `GET /users/:Username`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Update user profile:**

    - `PUT /users/:Username`
    - Request Body (example):
        ```json
        {
          "Username": "newUsername",
          "Password": "newPassword",
          "Email": "newemail@example.com",
          "Birthday": "YYYY-MM-DD"
        }
        ```

- **Delete a user:**

    - `DELETE /users/:Username`

### Movies

- **Get all movies:**

    - `GET /movies`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Get a single movie by title:**

    - `GET /movies/:Title`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Get a movie's genre by name:**

    - `GET /genres/:Name`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Get a movie's director by name:**

    - `GET /directors/:Name`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Add a movie to user’s favorites:**

    - `POST /users/:Username/movies/:MovieID`
    - Headers:
        - Authorization: Bearer `<JWT token>`

- **Remove a movie from user’s favorites:**

    - `DELETE /users/:Username/movies/:MovieID`
    - Headers:
        - Authorization: Bearer `<JWT token>`

## Authentication

This API uses JWT for user authentication. After logging in, the user receives a token that must be included in the `Authorization` header as `Bearer <token>` for subsequent requests.

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

