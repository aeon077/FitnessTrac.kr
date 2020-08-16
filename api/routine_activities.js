const express = require('express');
const routineActivtyRouter = express.Router();

const { requireUser, getAllRoutinesByUser, addActivityToRoutine, destroyRoutineActivity } = require('../db');

//sets route for routine activities
routineActivtyRouter.use((req, res, next) => {
    console.log("Aquiring routine activities");

    next();
});

//Updates the count or duration on the routine activity
//must be logged in and author
routineActivtyRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId: id } = req.params;
    const { count, duration } = req.body;
    const user = req.user

    const updateRoutineActivity = {}

    if (count) {
        updateRoutineActivity.count = count
    }
    if (duration) {
        updateRoutineActivity.duration = duration;
    }

    try {
        const [{ id: creatorId }] = await getAllRoutinesByUser(id)
        if (creatorId !== user.id) {
            next({
                name: 'notTheCreator',
                message: 'Only the creator can delete this routine'
            })
        }
        const updatedRoutineActivity = await addActivityToRoutine({ id, count, duration });
        res.send({ message: 'routineActivityUpdated', updatedRoutineActivity })
    } catch {
        next({
            name: 'errorUpdateRoutineActivity',
            message: 'There was an error updating this routine activity.'
        })
    }
});

//Removes an activity from a routine
//must be logged in and author
routineActivtyRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId: id } = req.params;
    const user = req.user;

    try {
        const [{ id: creatorId }] = await getAllRoutinesByUser(id)
        if (creatorId !== user.id) {
            next({
                name: 'notTheCreator',
                message: 'Only the creator can delete this routine'
            })
        }
        await destroyRoutineActivity(id);
        res.send({
            message: "Routine activity successfully deleted!"
        })
    } catch {
        next({
            name: 'errorDeletingRoutineActivity',
            message: 'There was an error deleting this activity from the routine'
        })
    }
});


module.exports = routineActivtyRouter