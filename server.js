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
  if (topic === mqttTopic) {
    const receivedCommand = message.toString();
    const currentDate = moment().tz('Asia/Kolkata');
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const formattedTime = currentDate.format('hh:mm:ss A');

    if (receivedCommand === '1') {
      appStatus = 'on';
    } else {
      appStatus = 'off';
    }

    db.run(
      'INSERT INTO historic_data (date, time, command, status) VALUES (?, ?, ?, ?)',
      [formattedDate, formattedTime, receivedCommand, appStatus],
      (err) => {
        if (err) {
          console.error('Error inserting data into database:', err.message);
        } else {
          console.log('Data has been inserted into the database');
          io.emit('newEntry', {
            date: formattedDate,
            time: formattedTime,
            command: receivedCommand,
            status: appStatus
          });
        }
      }
    );

    io.emit('statusUpdate', appStatus);
  }
});

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

io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

app.get('/historic-data', (req, res) => {
  db.all('SELECT * FROM historic_data ORDER BY date DESC, time DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving data from the database:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('historic-data', { rows: rows, darkMode: req.query.darkMode === 'true' });
    }
  });
});

app.post('/delete-data', (req, res) => {
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
