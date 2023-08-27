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
            res.status(400).json({ error: 'User registration failed' });
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
  // ... Code for deleting data from historic_data table ...
});

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    res.redirect('/home'); // Redirect to the home page if user is logged in
  } else {
    next();
  }
};



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
