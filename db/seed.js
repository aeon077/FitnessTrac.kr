const { client } = require('./client');

async function testDB() {
    try {
        client.connect();

        const { rows } = await client.query(`SELECT * FROM users;`);
        console.log(rows);
    } catch (error) {
        console.error(error);
    } finally {
        client.end();
    }
}