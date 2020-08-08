module.exports = {
    ...require('./client'), // re-export client for use in our server file
    ...require('./users'), // adds key/values from users.js
    ...require('./activities'), // adds key/values from activites.js
    ...require('./routines'), // etc
    ...require('./routine_activities') // etc
}