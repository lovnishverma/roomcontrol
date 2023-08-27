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
        status TEXT,
        username TEXT
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


// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  userDb.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Error retrieving user data:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!user) {
      res.status(401).json({ error: 'Authentication failed' });
    } else {
      bcrypt.compare(password, user.password, (bcryptErr, result) => {
        if (bcryptErr) {
          console.error('Error comparing passwords:', bcryptErr.message);
          res.status(500).json({ error: 'Internal Server Error' });
        } else if (result) {
          // Set session variable to indicate user is logged in
          req.session.loggedInUser = username;
          app.locals.username = username; // Store username in app.locals
          res.redirect('/'); // Redirect to the home page after successful login
        } else {
          res.status(401).json({ error: 'Authentication failed' });
        }
      });
    }
  });
});

// Render login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Registration route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      userDb.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err) => {
          if (err) {
            console.error('Error registering user:', err.message);
            if (err.code === 'SQLITE_CONSTRAINT') {
              res.status(400).json({ error: 'Username already exists' });
            } else {
              res.status(400).json({ error: 'User registration failed' });
            }
          } else {
            console.log('User registered:', username);
            res.redirect('/login'); // Redirect to the login page after successful registration
          }
        }
      );
    }
  });
});


// Render register form
app.get('/register', (req, res) => {
  res.render('register');
});

// Delete data route
app.post('/delete-data', (req, res) => {
  // Delete all data from the historic_data table
  db.run('DELETE FROM historic_data', (err) => {
    if (err) {
      console.error('Error deleting data:', err.message);
      res.status(500).json({ error: 'An error occurred while deleting data.' });
    } else {
      console.log('Historic data deleted');
      res.sendStatus(200);
    }
  });
});

// Render home page for logged-in user
app.get('/', isLoggedIn, (req, res) => {
  // Retrieve user-specific data or perform any other actions you need
  // For example, you can fetch additional data from the database based on the logged-in user

  res.render('home', {
    username: req.session.loggedInUser,
    // Pass any additional data you want to display on the home page
  });
});

// Define the /logout route
app.post('/logout', (req, res) => {
  // Clear the user's session data to log them out
  req.session.destroy(err => {
    if (err) {
      console.error('Error while logging out:', err);
    } else {
      console.log('User logged out');
      // Redirect the user to the login page after logging out
      res.redirect('/login');
    }
  });
});

// Other routes
// ...

// Server listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});