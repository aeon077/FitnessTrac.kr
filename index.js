//creating a foundation for the web server
require('dotenv').config();
const { PORT = 3000 } = process.env;
const express = require('express');
const server = express();

//middleware
const bodyParser = require('body-parser');
server.use(bodyParser.json());

const morgan = require('morgan');
server.use(morgan('dev'));

//set up routes
const apiRouter = require('./api/index');
server.use('/api', apiRouter);

server.use((req, res, next) => { //middleware that tells server to always run this function (three lines of code)
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");

    next();
});


//connects client to the server
const { client } = require('./db');
client.connect();

server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});