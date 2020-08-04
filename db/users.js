const { client } = require('./client');

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username 
      FROM users;
    `);

    return rows;
}

module.exports = {
    client,
    getAllUsers
}