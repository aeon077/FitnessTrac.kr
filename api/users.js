const jwt = require('jsonwebtoken');
const express = require('express');
const usersRouter = express.Router();
const bcrypt = require('bcrypt');

const { getAllUsers, getUser, createUser, getUserByUsername } = require('../db');

usersRouter.use((req, res, next) => {

    console.log("Request being made to /users");

    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    })
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;

    // request must have both
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && hashedPassword == hashedPassword) {

            bcrypt.compare(password, hashedPassword, (err, passwordsMatch) => {
                if (passwordsMatch) {

                    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
                    console.log(token);
                    // create token & return to user
                    res.send({ message: "you're logged in!", token })
                };
            })
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});


//sets route for registering a user
usersRouter.post('./register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
    const SALT_COUNT = 10;

    try {
        const user = await getUser(username);
        let securedPassword;

        if (user) {
            next({
                name: 'UserExistsError',
                message: 'Username already taken'
            });
        };

        bcrypt.hash(password, SALT_COUNT, async function (err, hashedPassword) {
            console.log(hashedPassword);
            securedPassword = hashedPassword
            const newUser = await createUser({
                username,
                password: hashedPassword, // not the plaintext
                name,
                location
            });
            console.log(newUser)
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: "Thank you for signing up",
            token
        });

    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = usersRouter;