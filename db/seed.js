const { client } = require('./client');
const { getAllUsers,
    createInitialUsers,
    getUser,
    getAllActivities,
    createInitialActivities,
    createInitialRoutines,
    getAllRoutines,
    getPublicRoutines,
    createInitialRoutineActivities,
    getActivitiesByRoutine,
    getPublicRoutinesByActivity,
    getPublicRoutinesByUser,
    getUserByUsername,
    getAllRoutinesByUser
} = require('./index');

//testing the database
async function testDB() {
    try {
        console.log("Testing, testing ...is this database on?");

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("getAllUsers:", users);

        console.log("Calling getAllActivities");
        const activities = await getAllActivities();
        console.log("Result:", activities)

        console.log("Calling on user");
        const user = await getUser({ username: "Bill", password: "Apollo2010" });
        console.log("User:", user)

        console.log("Calling getAllRoutines");
        const routines = await getAllRoutines();
        console.log("Result:", routines)

        console.log("Calling getPublicRoutines");
        const pubRoutines = await getPublicRoutines();
        console.log("Result:", pubRoutines)

        console.log("Calling Activities by Routine")
        const actRoutine = await getActivitiesByRoutine(1);
        console.log('Result:', actRoutine)

        console.log("Calling Public Routines by Activity ")
        const pubRoutAct = await getPublicRoutinesByActivity(1);
        console.log('Result:', pubRoutAct)

        console.log("Calling user by username ")
        const userByUsername = await getUserByUsername("Bill");
        console.log('Result:', userByUsername)

        console.log("Calling routines by username ")
        const userRoutines = await getAllRoutinesByUser(4)
        console.log('Result:', userRoutines)

        console.log("Calling Public routines by user ")
        const pubRoutUser = await getPublicRoutinesByUser(1);
        console.log('Result:', pubRoutUser)

        console.log("Database test complete!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        // have to make sure to drop in correct order
        await client.query(`
        DROP TABLE IF EXISTS routine_activities;
        DROP TABLE IF EXISTS routines;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
      `);
        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

// this function should call a query which creates all tables for our database 
async function createTables() {
    try {
        console.log("Starting to build the tables");

        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active boolean DEFAULT true
          );

          CREATE TABLE activities (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL,
            description varchar(500) NOT NULL,
            active boolean DEFAULT true
          );

          CREATE TABLE routines (
              id SERIAL PRIMARY KEY,
              "creatorId" INTEGER REFERENCES users(id),
              public boolean DEFAULT false,
              name VARCHAR(255) UNIQUE NOT NULL,
              goal TEXT NOT NULL,
              active boolean DEFAULT true  
          );

          CREATE TABLE routine_activities (
            id SERIAL PRIMARY KEY,
            "routineId" INTEGER REFERENCES routines(id),
            "activityId" INTEGER REFERENCES activities(id),
            duration INTEGER,
            count INTEGER,
            active boolean DEFAULT true,
            UNIQUE ("routineId", "activityId")  
          );
      `);
        console.log("Tables have been built!")
    } catch (error) {
        console.log("There has been an error in building the tables")
        throw error; // we pass the error up to the function that calls createTables
    }
}

//drops and rebuilds database, initial users/activities
async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialActivities();
        await createInitialRoutines();
        await createInitialRoutineActivities()
    } catch (error) {
        throw error;
    }
}

//bootstrap
rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());