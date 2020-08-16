const { client } = require('./client');
const { getUserByUsername } = require('./index');

//creating initial preloaded activities
async function createInitialRoutines() {

    try {
        console.log("Starting to create routines...");

        await createRoutine({
            creatorId: 1,
            public: true,
            name: "Monday",
            goal: "Yoga of some kind",
            active: true
        })

        await createRoutine({
            creatorId: 2,
            public: false,
            name: "Yoga Days",
            goal: "60 minutes every day",
            active: true
        })

        await createRoutine({
            creatorId: 3,
            public: true,
            name: "Abs Day",
            goal: "Rock hard abs.",
            active: true
        });

        console.log("Finished creating routines");
    } catch (error) {
        throw error;
    }
}

//added this function to help with some functionality in the database (not in the methods listed)
//helps in creating join in activities to the routine_activities to help with other functions, especially getAllRoutines including activities. 
//defines routines_activities as a, activities as b. 
//WHERE statement filters rows where left join does not succeed (in both a and b)
async function getActivitiesByRoutine(routine) {
    const { id } = routine
    try {
        const { rows } = await client.query(`
        SELECT 
        a.id,
        a.name,
        a.description,
        ra."routineId",
        ra.duration,
        ra.count
        FROM activities AS a
        LEFT JOIN routine_activities AS ra
        ON a.id = ra."activityId"
        WHERE ra."routineId" = $1;
    `, [id])
        return rows;
    } catch (error) {
        console.log(`Error getting activities for routine`, error);
        throw error;
    }
}

//select and return an array of all routines, *include their activities*
async function getAllRoutines() {
    try {
        const { rows: routines } = await client.query(`
      SELECT *
      FROM routines;
    `);

        const results = routines.map(async function (routine) {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });


        const routineElem = await Promise.all(results).then(function (rout) {
            // console.log(rout);
            return rout;
        });
        return routineElem;
    } catch (error) {
        console.log(`Error getting routines`, error);
        throw error;
    }
}

//creates and returns the new routine
async function createRoutine({
    creatorId, public, name, goal
}) {
    try {
        const { rows } = await client.query(`
      INSERT INTO routines ("creatorId", public, name, goal) 
      VALUES($1, $2, $3, $4) 
      RETURNING *;
    `, [creatorId, public, name, goal]);

        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

//Find the routine with id equal to the passed in id
//Don't update the routine id, but do update the public status, name, or goal, as necessary
//Return the updated routine
async function updateRoutine({ id, fields = {} }) {
    //setString for mapping out public, name, and goal
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [routine] } = await client.query(`
        UPDATE routines
        SET ${ setString}
        WHERE id=${ id}
        RETURNING *;
        `, Object.values(fields));

        return routine;
    } catch (error) {
        throw error;
    }
}

//selects and return an array of public routines, include their activities
async function getPublicRoutines() {
    try {
        const { rows: routines } = await client.query(`
      SELECT *
      FROM routines
      WHERE public='true';
    `);
        //maps the activities_routines with public true
        const results = routines.map(async function (routine) {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });
        //maps out the routines from above
        const routineElement = await Promise.all(results).then(function (rout) {
            return rout;
        });

        return routineElement;
    } catch (error) {
        console.log('Error retrieving public routines', error)
        throw error;
    }
}

//selects and returns an array of all routines made by user, include their activities

async function getAllRoutinesByUser(userId) {
    try {
        const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines
        WHERE "creatorId"=${userId}
        `);

        const results = routineIds.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const userActivities = await Promise.all(results).then(function (ele) {
            return ele
        });
        return userActivities;
    } catch (error) {
        console.log('Error getting routines by user')
        throw error
    }
}


//selects and returns an array of public routines made by user, include their activities
async function getPublicRoutinesByUser(userId) {
    try {
        const { rows: routineIds } = await client.query(`
        SELECT *
        FROM routines
        WHERE "creatorId"=${userId}
        AND public='true';
        `);

        const results = routineIds.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return activities;
        });

        const routineEle = await Promise.all(results).then((elem) => {
            console.log(elem);
            return elem;
        });
        return routineEle
    } catch (error) {
        console.log('Error getting public routines by user');
        throw error
    }
};


//select and return an array of public routines which have a specific activityId in their routine_activities join, include their activities
//routines = a, routine_activities = b
async function getPublicRoutinesByActivity({ activityId }) {
    try {
        const { rows: routines } = await client.query(`
        SELECT
        a.id,
        a."creatorId",
        a.public,
        a.name,
        a.goal,
        b."activityId"
        FROM routines AS a
        JOIN routine_activities AS b
        ON a.id = b."routineId"
        WHERE "activityId"=$1
        AND public='true';
        `, [activityId]);

        const results = routines.map(async function (routines) {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine
        });

        const routineEle = await Promise.all(results).then(function (elem) {
            return elem
        });
        return routineEle
    } catch (error) {
        console.log('Error getting public routines by activity')
        throw error;
    }
}


//removes routine from database
//Makes sure to delete all the routine_activities whose routine is the one being deleted.
async function destroyRoutine(id) {
    try {
        const { rows: [routines] } = await client.query(`
        DELETE FROM routines
        WHERE id=$1;
        `)
        if (!id) {
            throw {
                name: "DeleteRoutineErrorId",
                message: "Could not find any routines by that id"
            }
        }

        const { rows: [routine_activities] } = await client.query(`
        DELETE FROM routine_activities
        WHERE routines.id=$1;
        `)

        return rows;
    } catch (error) {
        throw {
            name: "DeleteRoutineError",
            message: "There was an error in deleting this routine"
        };
    }
}


module.exports = {
    client,
    createInitialRoutines,
    getActivitiesByRoutine,
    getAllRoutines,
    createRoutine,
    updateRoutine,
    getPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByActivity,
    destroyRoutine,
    getPublicRoutinesByUser
}