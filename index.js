//creating a foundation for the web server
const PORT = 3000;
const express = require('express');
const server = express();

server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});