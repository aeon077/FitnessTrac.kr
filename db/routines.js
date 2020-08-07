const { client } = require('./client');
const { getAllUsers } = require('./users');
const users = require('./users');

//creating initial preloaded activities
async function createInitialRoutines() {

    const [William, Kat, Chris] = await getAllUsers();

    try {
        console.log("Starting to create routines...");

        await createRoutine({
            creatorId: William.id,
            public: true,
            name: "Monday Workout",
            goal: "60 minutes",
            active: true
        })

        await createRoutine({
            creatorId: Kat.id,
            public: false,
            name: "Yoga Days",
            goal: "60 minutes",
            active: true
        })

        await createRoutine({
            creatorId: Chris.id,
            public: true,
            name: "Abs Day",
            goal: "5 reps",
            active: true
        });

        console.log("Finished creating routines");
    } catch (error) {
        throw error;
    }
}
//select and return an array of all routines, include their activities
async function getAllRoutines() {
    try {
        const { rows } = await client.query(`
      SELECT id, "creatorId", public, name, goal, active 
      FROM routines;
    `);

        return rows;
    } catch (error) {
        throw error;
    }
}

//createRoutine({ creatorId, public, name, goal })
//create and return the new routine
async function createRoutine({
    creatorId, public, name, goal
}) {
    try {
        const { rows: [routine] } = await client.query(`
      INSERT INTO routines ("creatorId", public, name, goal) 
      VALUES($1, $2, $3, $4) 
      RETURNING *;
    `, [creatorId, public, name, goal]);

        return routine;
    } catch (error) {
        throw error;
    }
}

//updateRoutine({ id, public, name, goal })
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

//select and return an array of public routines, include their activities
async function getPublicRoutines() {
    try {
        const { rows: [routines] } = await client.query(`
      SELECT id, "creatorId", public, name, goal, active 
      FROM routines
      WHERE public=true;
    `, [creatorId]);

        if (!routines) {
            throw {
                name: "PublicUserError",
                message: "Could not find any users with public posts"
            }
        }
        //need to complete routines_activities first!!
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        INNER JOIN id ON routines."creatorId"
        WHERE routines."creatorId=true;
    `, [creatorId])

        return rows;
    } catch (error) {
        throw error;
    }
}
//*******/
//destroyRoutine(id)
//remove routine from database
//Make sure to delete all the routine_activities whose routine is the one being deleted.
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
    getAllRoutines,
    createRoutine,
    updateRoutine,
    getPublicRoutines,
    destroyRoutine
}