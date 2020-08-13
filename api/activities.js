const express = require('express');
const activitiesRouter = express.Router();

const { getAllActivities, requireUser, createActivity } = require('../db');

//sets route for activities
activitiesRouter.use((req, res, next) => {
    console.log("Aquiring activities");

    next();
});

//returns a list of all the activities in the database
activitiesRouter.get('/', async (req, res) => {
    const activities = await getAllActivities();

    res.send({
        activities
    })
});

//creates a new activity
activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;
    const newActivity = {};

    try {
        newActivity.name = req.user.id;
        newActivity.description = description;

        const activity = await createActivity(newActivity);

        if (activity) {
            res.send({ activity })
        } else {
            next({
                name: 'NewActivityError',
                message: 'There was an error creating the new activity'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

module.exports = activitiesRouter;