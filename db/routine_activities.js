const { client } = require('./client');

//preload routine activities into the database
async function createInitialRoutineActivities() {

    try {
        console.log("Starting to create routine activities...");

        await addActivityToRoutine({
            routineId: 1,
            activityId: 2,
            count: 1,
            duration: 60,
        })

    } catch (error) {
        throw error;
    }
};


//Finds the routine with id equal to the passed in id
//Updates the count or duration as necessary
async function updateRoutineActivity({ id, fields = {} }) {
    //setString for mapping out public, name, and goal
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [routine_activities] } = await client.query(`
        UPDATE routine_activities
        SET ${ setString}
        WHERE id=${ id}
        RETURNING *;
        `, Object.values(fields));

        return routine_activities;
    } catch (error) {
        throw error;
    }
}

//create a new routine_activity, and return it
async function addActivityToRoutine({ routineId, activityId, count, duration }) {
    try {
        const { rows: routine_activity } = await client.query(`
        INSERT INTO routine_activities ("routineId", "activityId", duration, count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("routineId", "activityId") DO NOTHING 
        RETURNING *;
    `, [routineId, activityId, count, duration]);

        return { routine_activity };
    } catch (error) {
        console.log('Error adding activity to routine', error)
        throw error;
    }
}

//remove routine_activity from database
async function destroyRoutineActivity(id) {
    try {
        await client.query(`
            DELETE FROM routine_activities
            WHERE id=$1;
        `, [id]);
        console.log('routineActivity deleted!');
    } catch (error) {
        console.log('Error deleting routine with Id ${id}')
        throw error;
    }
}

module.exports = {
    addActivityToRoutine,
    createInitialRoutineActivities,
    destroyRoutineActivity,
    updateRoutineActivity
}