const jwt = require('jsonwebtoken');
const express = require('express');
const usersRouter = express.Router();
const bcrypt = require('bcrypt');

const { getAllUsers, getUser, createUser, getUserByUsername, getPublicRoutinesByUser } = require('../db');

usersRouter.use((req, res, next) => {

    console.log("Request being made to /users");

    next();
});
//sets route for users
usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    })
});

//user login
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
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
    const SALT_COUNT = 10;

    try {
        const username = await getUser(username);

        if (await getUser({ username })) {
            next({
                name: 'UserExistsError',
                message: 'Username already taken'
            });
        } else if (password.length < 8) {
            next({
                name: 'PasswordError',
                message: 'Password must be atleast 8 characters'
            });
        } else {
            bcrypt.hash(password, SALT_COUNT, async function (err, hashedPassword) {

                const newUser = await createUser({
                    username,
                    password: hashedPassword, // not the plaintext
                    name,
                    location
                });
                console.log(newUser)

                const token = jwt.sign({
                    id: newUser.id,
                    username
                }, process.env.JWT_SECRET, {
                    expiresIn: '1w'
                });
                res.send({
                    message: "Thank you for signing up",
                    token
                })
            });


        };

    } catch ({ name, message }) {
        next({ name, message })
    }
});

//Get a list of public routines for a particular user.
usersRouter.get('/:username/routines', async function (req, res, next) {
    try {
        const { username } = req.params;
        const userRoutine = await getPublicRoutinesByUser(username);

        const routines = userRoutine.filter(routine => {
            return routine
        });

        res.send({ routines })
    } catch ({ name, message }) {
        next({
            name: 'UserPublicRoutines',
            message: 'There was an error fetching these public routines.'
        })
    }
})

module.exports = usersRouter;