const express = require('express');
const routinesRouter = express.Router();
const { requireUser, getPublicRoutines, createRoutine, updateRoutine, getAllRoutinesByUser, destroyRoutine, addActivityToRoutine } = require('../db');

//sets route for routines
routinesRouter.use((req, res, next) => {
    console.log("Aquiring routines");
    next();
});

//returns a list of public routines and their activities
routinesRouter.get('/', async (req, res, next) => {
    try {
        const routines = await getPublicRoutines();
        res.send({ routines });
    } catch {
        next({
            name: 'getPublicRoutineError',
            message: 'There was an error getting public routines'
        })
    }
});

//creates a new routine
//must be logged in
routinesRouter.post('/', requireUser, async (req, res, next) => {
    const { id: creatorId } = req.user;
    const { public, name, goal } = req.body;

    try {
        const routine = await createRoutine({ creatorId, public, name, goal })

        res.send({ routine })
    } catch {
        next({
            name: 'createRoutineError',
            message: 'There was an error creating this routine'
        })
    }
});

//Updates a routine, public/private, name, and goal
//must be logged in and author
routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
    const { creatorId: id } = req.params;
    const { public, name, goal } = req.body;
    const { user } = req.user;

    try {
        const { creatorId } = await getAllRoutinesByUser({ username })
        console.log(username)
        if (creatorId !== user.id) {
            next({
                name: 'notTheCreator',
                message: 'Only the creator can edit this routine.'
            })
        }
        const routine = await updateRoutine(id, { public, name, goal });
        res.send({ routine })
    } catch {
        next({
            name: 'errorUpdateRoutine',
            message: 'There was an error updating this routine'
        })
    }
});


//Hard deletes a routine, including its routineActivities.
//must be logged in and author
routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    const { routineId: id } = req.params;
    const user = req.user;

    try {
        const [{ creatorId }] = await getAllRoutinesByUser({ user })
        if (creatorId !== user.id) {
            next({
                name: 'notTheCreator',
                message: 'Only the creator can delete this routine'
            })
        }
        await destroyRoutine(id);
        res.send({
            message: "Routine successfully deleted!"
        })
    } catch {
        next({
            name: 'errorDeletingRoutine',
            message: 'There was an error deleting this routine'
        })
    }
});

//Attaches a single activity to a routine. Prevents duplication on (routineId, activityId) pair.

routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    const { activityId, duration, count } = req.body;

    const postData = {}

    try {
        postData.routineId = routineId;
        postData.activityId = activityId;
        postData.count = count;
        postData.duration = duration;
        const routine = await addActivityToRoutine({ routineId, activityId, duration, count });
        console.log(routine);

        res.send({ routine })
        // };
    } catch {
        next({
            name: 'errorActivityRoutineAdd',
            message: 'Error adding this activity to this routine'
        })
    }
})

module.exports = routinesRouter;