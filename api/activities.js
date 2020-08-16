const express = require('express');
const activitiesRouter = express.Router();

const { getAllActivities, requireUser, createActivity, updateActivity, getPublicRoutinesByActivity } = require('../db');

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
//must be logged in
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
                name: 'newActivityError',
                message: 'There was an error creating the new activity'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

//Anyone can update an activity, but must be logged in
//must be logged in
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;
    const updatedActivity = {};

    if (name) {
        updatedActivity.name = name;
    }

    if (description) {
        updatedActivity.description = description
    }

    try {
        const updatedActivity = await updateActivity(activityId, updatedActivity);
        res.send({ updatedActivity })
    } catch {
        next({
            name: 'updateActivityError',
            message: 'There was an error updating this activity.'
        })
    }
});

//Gets a list of all public routines which feature that activity
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
    const { activityId } = req.params;

    try {
        const routines = await getPublicRoutinesByActivity({ activityId });
        res.send({ routines });

    } catch {
        next({
            name: 'publicRoutinesByActivityError',
            message: 'There was an error getting public routines by that activity'
        })
    }
})


module.exports = activitiesRouter;