const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine

const brokerUrl = 'mqtt://broker.hivemq.com';
const mqttTopic = 'mytopic/nielit';
const qos = 0;

const client = mqtt.connect(brokerUrl);

let appStatus = 'off';

// Connect to the SQLite database for users
const userDb = new sqlite3.Database('user_data.db', (err) => {
  if (err) {
    console.error('Error connecting to the user database:', err.message);
  } else {
    console.log('Connected to the user SQLite database');
    userDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT
      )
    `);
  }
});

const db = new sqlite3.Database('historic_data.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS historic_data (
        id INTEGER PRIMARY KEY,
        date TEXT,
        time TEXT,
        command TEXT,
        status TEXT
      )
    `);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    store: new SQLiteStore(),
    secret: 'mqtt@817',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
  })
);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(mqttTopic, { qos });
});

client.on('message', (topic, message) => {
  // ... Code for handling MQTT messages ...
});

app.post('/send-command', (req, res) => {
  // ... Code for sending MQTT commands ...
});

app.get('/app-status', (req, res) => {
  // ... Code for retrieving app status ...
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});


app.get('/historic-data', (req, res) => {
  // ... Code for retrieving and rendering historic data ...
});

// Registration route
app.post('/register', (req, res) => {
  // ... Code for user registration using bcrypt ...
});

// Login route
app.post('/login', (req, res) => {
  // ... Code for user login using bcrypt and session ...
});

// Delete data route
app.post('/delete-data', (req, res) => {
  // ... Code for deleting data from historic_data table ...
});

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Render login form
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Compare the provided password with the hashed password in the database
  // Set session variables on successful login
});

// Render register form
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password and insert user data into the users table
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    // Handle registration success or failure
  });
});


// Render home page for logged-in user
app.get('/', isLoggedIn, (req, res) => {
  // ... Code for rendering the home page ...
});

// Other routes
// ...

// Server listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
