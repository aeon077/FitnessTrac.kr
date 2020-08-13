const jwt = require('jsonwebtoken');
const { getUserByUsername } = require('../db');
const { JWT_SECRET } = process.env;

const express = require('express');
const apiRouter = express.Router();

//three possibilities when requesting API
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) { //DENIED!
        next();
    } else if (auth.startsWith(prefix)) { //if auth starts with Bearer, it adds token
        const token = auth.slice(prefix.length);

        try {
            const { username } = jwt.verify(token, JWT_SECRET);
            //reads and descrypts token, verifies, and reads user data from database
            if (username) {
                req.user = await getUserByUsername(username);
                next();
            }
        } catch ({ name, message }) {
            next({ name, message });
        }
    } else { //or it will throw error with name and message
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    }
});

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

// const routineRouter = require('./routines');
// apiRouter.use('/routines', routineRouter);

// const routineActRouter = require('./routine_activities');
// apiRouter.use('/routines_activities', routineActRouter);

//error handler
apiRouter.use((error, req, res, next) => {
    res.send(error);
});

module.exports = apiRouter;