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

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine

const brokerUrl = 'mqtt://broker.hivemq.com';
const mqttTopic = 'mytopic/nielit';
const qos = 0;

const client = mqtt.connect(brokerUrl);

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
  if (topic === mqttTopic) {
    const receivedCommand = message.toString();
    const currentDate = moment().tz('Asia/Kolkata');
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const formattedTime = currentDate.format('hh:mm:ss A');

    // Retrieve the username associated with the socket that sent the message
    const socketId = clientSocketMap[topic];
    const username = socketUserMap[socketId] || loggedInUsername;

    if (receivedCommand === '1') {
      appStatus = 'on';
    } else {
      appStatus = 'off';
    }

    // Insert data into the SQLite database
    db.run(
      'INSERT INTO historic_data (date, time, command, status, username) VALUES (?, ?, ?, ?, ?)',
      [formattedDate, formattedTime, receivedCommand, appStatus, username],
      (err) => {
        if (err) {
          console.error('Error inserting data into database:', err.message);
        } else {
          console.log('Data has been inserted into the database');

          // Emit newEntry event to connected clients
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
  }
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
  client.publish(mqttTopic, command.toString(), { qos });

  if (command === '1') {
    appStatus = 'on';
  } else {
    appStatus = 'off';
  }

  res.send(`Command sent: ${command}`);
});

app.get('/app-status', (req, res) => {
  res.json({ status: appStatus });
});

const server = http.createServer(app);
const io = socketIo(server);

const socketUserMap = {}; // Initialize a map to store socket IDs and usernames

io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('toggleSwitch', (data) => {
    const { isChecked, username } = data;

    // Store the username associated with the socket ID
    socketUserMap[socket.id] = username;

    // Emit the toggleSwitch event to other connected clients
    socket.broadcast.emit('toggleSwitch', { isChecked, username });
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
    // Remove the socket ID and username mapping when a client disconnects
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
// To turn the app on: https://mqttnodejs2.glitch.me/toggle-app?state=on
// To turn the app off: https://mqttnodejs2.glitch.me/toggle-app?state=off



app.use(bodyParser.json()); // Use JSON parser

// ...

// Predefined responses based on patterns
const responses = [
    { pattern: /lights on|light on|turn on|switch on/i, response: 'Sure, turning the lights on.', action: 'turnOnLights' },
    { pattern: /lights off|light off|turn off|switch off/i, response: 'Okay, turning the lights off.', action: 'turnOffLights' },
   { pattern: /hello|hi|hola/i, response: 'Hello! How can I assist you today?' },
    { pattern: /how are you/i, response: 'I am just a chatbot, but I\'m here to assist you!' },
    { pattern: /joke/i, response: 'Why did the scarecrow win an award? Because he was outstanding in his field!' },
    { pattern: /(my name is|I am) (.*)/i, response: 'Nice to meet you, $2!' },
    { pattern: /What is the communication address of the NIELIT HQ?|nielit address/i, response: 'Address to contact NIELIT is: NIELIT Bhawan, Plot No. 3, PSP Pocket, Sector-8, Dwarka, New Delhi-110077, Helpline No. (Toll Free) - 1800116511 Phone:- 91-11-2530 8300 with 29 lines Email:- contact@nielit.gov.in' },
    { pattern: /help/i, response: 'I can help you turn on/off switches remotely. Just tell me which switch you want to control.' },
    { pattern: /security/i, response: 'Your security is our priority. How can I assist you with security measures?' },
    { pattern: /goodbye|bye|exit/i, response: 'Goodbye! If you need assistance, feel free to come back.' },
];

// ...

// Function to handle user messages and actions
function handleUserMessage(userMessage) {
    let response = "I'm sorry, I don't understand that question. Please ask something else.";
    let action = null;

    for (const { pattern, response: responseText, action: responseAction } of responses) {
        if (pattern.test(userMessage)) {
            response = responseText;
            action = responseAction;
            break;
        }
    }

    return { response, action };
}

// ...

// API endpoint for chat with action handling
// API endpoint for chat with action handling
app.post('/api/chat', (req, res) => {
    const userMessage = req.body.userMessage;
    const { response, action } = handleUserMessage(userMessage);

    // Perform action if specified
    if (action === 'turnOnLights') {
        // Add logic to turn on lights (e.g., publish MQTT command)
        const command = '1';
        client.publish(mqttTopic, command, { qos });
        io.emit('statusUpdate', 'on'); // Update status immediately for actions
        res.json({ response }); // Respond immediately for actions without checking status
    } else if (action === 'turnOffLights') {
        // Add logic to turn off lights (e.g., publish MQTT command)
        const command = '0';
        client.publish(mqttTopic, command, { qos });
        io.emit('statusUpdate', 'off'); // Update status immediately for actions
        res.json({ response }); // Respond immediately for actions without checking status
    } else {
        // No specific action, respond with the general message
        res.json({ response });
    }
});


// ...
// Server listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 