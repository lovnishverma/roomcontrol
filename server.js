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
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env for security purposes
const app = express();
// Enable CORS for all routes
app.use(cors());
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine



// Load MQTT credentials from environment variables
const brokerUrl = process.env.MQTT_BROKER_URL;
const mqttTopic = '212';
const qos = 0;

const options = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false
};

const client = mqtt.connect(brokerUrl, options);

// Session configuration with secret from .env
app.use(
  session({
    store: new SQLiteStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud MQTT broker');
  client.subscribe(mqttTopic, { qos }, (err) => {
    if (err) {
      console.error('🚨 Subscription error:', err.message);
    } else {
      console.log(`📡 Subscribed to topic: ${mqttTopic}`);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`📩 Received message on topic "${topic}": ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('⚠️ MQTT Error:', err.message);
});


const clientSocketMap = {};

let loggedInUsername = null;
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
        username TEXT UNIQUE,
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

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(mqttTopic, { qos });
});

client.on('message', (topic, message) => {
  console.log(`📩 Received MQTT message on topic "${topic}": ${message.toString()}`);

  const receivedCommand = message.toString();
  const currentDate = moment().tz('Asia/Kolkata');
  const formattedDate = currentDate.format('YYYY-MM-DD');
  const formattedTime = currentDate.format('hh:mm:ss A');

  // Use the last stored username (fallback to 'Unknown User' if empty)
  const username = global.lastCommandUser || 'Unknown User';

  appStatus = receivedCommand === '1' ? 'on' : 'off';

  // Insert into database with correct username
  db.run(
    'INSERT INTO historic_data (date, time, command, status, username) VALUES (?, ?, ?, ?, ?)',
    [formattedDate, formattedTime, receivedCommand, appStatus, username],
    (err) => {
      if (err) {
        console.error('🚨 Error inserting data:', err.message);
      } else {
        console.log(`✅ Stored: ${username} turned ${appStatus}`);

        // Notify all clients
        io.emit('newEntry', {
          date: formattedDate,
          time: formattedTime,
          command: receivedCommand,
          status: appStatus,
          username: username,
        });
      }
    }
  );

  io.emit('statusUpdate', appStatus);
});




// // Schedule to turn on the switch at 6:00 PM every day
// cron.schedule('0 18 * * *', () => {
//   const command = '1'; // Turn on command
//   client.publish(mqttTopic, command, { qos });
//   console.log('Scheduled task: Turn on the switch');
// });

// // Schedule to turn off the switch at 7:00 AM every day
// cron.schedule('0 7 * * *', () => {
//   const command = '0'; // Turn off command
//   client.publish(mqttTopic, command, { qos });
//   console.log('Scheduled task: Turn off the switch');
// });

// Middleware to check if user is logged in

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.post('/send-command', (req, res) => {
  const command = req.body.command;
  const username = req.session.loggedInUser || 'Unknown User'; // Get the logged-in user

  // Store the last user who sent the command
  global.lastCommandUser = username;

  client.publish(mqttTopic, command.toString(), { qos });

  appStatus = command === '1' ? 'on' : 'off';

  res.send(`Command sent: ${command} by ${username}`);
});

app.get('/app-status', (req, res) => {
  res.json({ status: appStatus });
});

const server = http.createServer(app);
const io = socketIo(server);

const socketUserMap = {}; // Store socket ID -> username mapping

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Store the username when the client registers it
  socket.on('registerUser', (username) => {
    socketUserMap[socket.id] = username;
    console.log(`✅ Registered User: ${username} for Socket ID: ${socket.id}`);
  });

  // Remove the user from the map when they disconnect
  socket.on('disconnect', () => {
    console.log('❌ A client disconnected:', socket.id);
    delete socketUserMap[socket.id];
  });
});




app.get('/historic-data', isLoggedIn, (req, res) => {
  // Retrieve data from the database and order by the most recent entries
  db.all('SELECT * FROM historic_data ORDER BY date DESC, time DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving data from the database:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      // Pass the darkMode variable as an option
      res.render('historic-data', { rows: rows, darkMode: req.query.darkMode === 'true' });
    }
  });
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
          // Store logged-in user in session
          req.session.loggedInUser = username;
          res.redirect('/'); // Redirect after successful login
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
app.get('/toggle-app', (req, res) => {
  const state = req.query.state; // Get the 'state' parameter from the URL

  if (state === 'on' || state === 'off') {
    // Publish the MQTT command based on the 'state' parameter
    const command = state === 'on' ? '1' : '0';
    client.publish(mqttTopic, command, { qos });
    res.send(`App turned ${state}`);
  } else {
    res.status(400).send('Invalid state parameter');
  }
});
// To turn the app on: https://roomcontrol.glitch.me/toggle-app?state=on
// To turn the app off: https://roomcontrol.glitch.me/toggle-app?state=off

app.use(bodyParser.json()); // Use JSON parser

// Server listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 