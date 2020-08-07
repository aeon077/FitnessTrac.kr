const { Client } = require('pg'); // imports the pg module

const client = new Client('postgres://localhost:5432/fitness-dev');
//process.env.DATABASE_URL ||

module.exports = {
    client
}