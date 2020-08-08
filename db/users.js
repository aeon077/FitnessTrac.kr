const { client } = require('./client');

//preloads initial users into database
async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        await createUser({
            username: 'Bill',
            password: 'Apollo2010',
            name: 'William',
            location: 'Ponte Vedra, FL'
        });

        await createUser({
            username: 'Apollo',
            password: 'Ie@tG1ue',
            name: 'Kat',
            location: 'Eagle River, AK'
        })

        await createUser({
            username: 'ChrisDog',
            password: 'I@mIr0nM@n',
            name: 'Chris',
            location: 'Peoria, IL'
        })

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

//select and return an array of all users
async function getAllUsers() {
    try {
        const { rows } = await client.query(`
      SELECT id, username, name, location, active 
      FROM users;
    `);

        return rows;
    } catch (error) {
        throw error;
    }
}

//createUser({ username, password })
//make sure to hash the password before storing it to the database --stretch goal
async function createUser({
    username,
    password,
    name,
    location
}) {
    try {
        const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);

        return user;
    } catch (error) {
        throw error;
    }
}

//getUser({ username, password })
//this should be able to verify the password against the hashed password -- stretch goal
async function getUser({ username, password }) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1
        AND password=$2
      `, [username, password]);
        //this is where I would check the hashed password
        return user;
    } catch (error) {
        throw error;
    }
}

//get user without password
//created this for help with getAllRoutinesByUser
async function getUserByUsername(username) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM username=$1;
        `, [username]);
        return user
    } catch (error) {
        console.log('Error getting username ${username}')
        throw error;
    }
}

module.exports = {
    client,
    getAllUsers,
    createInitialUsers,
    createUser,
    getUser,
    getUserByUsername
}