const { client } = require('./client');

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

async function createRoutine({
    creatorId, public, name, goal
}) {
    try {
        const { rows: [routine] } = await client.query(`
      INSERT INTO routines ("creatorId", public, name, goal) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (creatorId) DO NOTHING 
      RETURNING *;
    `, [creatorId, public, name, goal]);

        return routine;
    } catch (error) {
        throw error;
    }
}

async function updateRoutine({ id, fields = {} }) {
    //setString for mapping out name and description
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


module.exports = {
    client,
    getAllRoutines,
    createRoutine,
    updateRoutine
}