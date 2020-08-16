const jwt = require('jsonwebtoken');
const express = require('express');
const usersRouter = express.Router();
const bcrypt = require('bcrypt');
const { JWT_SECRET } = process.env;

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

    // request must have both
    try {
        const user = await getUser({ username, password });
        if (!user) {
            next({
                name: "errorCredentials",
                message: "Username or password was incorrect"
            })
        } else {
            const token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            })
            res.send({
                message: "Login Successful!",
                token
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});


//sets route for registering a user
//requires password to be atleast 8 characters
//checks if username already exists
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
    const SALT_COUNT = 10;

    try {
        const user = await getUserByUsername(username);
        console.log(user);
        if (user) {
            next({
                name: 'UserExistsError',
                message: 'This username already exists'
            })
        } else if (password.length < 8) {
            next({
                name: 'invalidPassword',
                message: 'Your password must be 8 characters or more'
            })
        }
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
            }, JWT_SECRET, {
                expiresIn: '1w'
            });
            res.send({
                message: "Thank you for signing up with FitnessTrac.kr!",
                token
            })
        })
    } catch {
        next({
            name: 'errorRegistration',
            message: 'There was an error registering this user.'
        })
    }
});

//Get a list of public routines for a particular user.
usersRouter.get('/:username/routines', async function (req, res, next) {
    const { username } = req.params;
    try {
        const routines = await getPublicRoutinesByUser(username);
        console.log(username)
        res.send(routines);
    } catch {
        next({
            name: 'errorPublicUserRoutines',
            message: 'There was an error fetching these public routines'
        })
    }
})

module.exports = usersRouter;