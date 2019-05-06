require('dotenv').config();
const express = require('express');
const CRUD = require("./CRUD");
const path = require("path");
const passport = require('passport');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
const configDB = require('./config/mongoose/database.js');

let testId;

mongoose.connect(configDB.url, {useNewUrlParser: true});

require("./config/passport/passport")(passport);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(express.static(path.join(__dirname, '/contest_data')));
app.use(passport.initialize());

let moduleMiddleware = (req, res, next) => {
    if (req.body.token === process.env.MODULE_TOKEN) {
        next();
    } else {
        return res.status(403).send("<h1>403: Unauthorized</h1>");
    }
};

/**
 * POST method that registers a new user
 */
app.post('/API/signupUser', (req, res, next) => {
    CRUD.signupUser(req, res, next)
});

/**
 * POST method that authenticates a user using credentials
 */
app.post('/API/loginUser', (req, res, next) => {
    CRUD.loginUser(req, res, next);
});

/**
 * GET method that verifies a user by access token
 */
app.get('/API/getUser', (req, res, next) => {
    CRUD.findUser(req, res, next);
});

/**
 * GET method that obtains a set of contests for a given user
 */
app.get('/API/tables', passport.authenticate('jwt', {session: false}), (req, res) => {
    CRUD.getTables(req, res, req.user);
});

/**
 * POST method that updates a table state
 */
app.post('/API/table/:tableId', moduleMiddleware, (req, res) => {
    CRUD.insertTable(req, res);
});

app.listen(process.env.PORT || 8081, () => {
    testId = 1;
    console.log(`Listening on :${process.env.PORT || 8081}`);
});
