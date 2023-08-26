const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment-timezone');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine

const brokerUrl = 'mqtt://broker.hivemq.com';
const mqttTopic = 'mytopic/nielit';
const qos = 0;

const client = mqtt.connect(brokerUrl);

let appStatus = 'off';

// Connect to the SQLite database
const db = new sqlite3.Database('historic_data.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    // Create the table if it doesn't exist
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

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(mqttTopic, { qos });
});

client.on('message', (topic, message) => {
  if (topic === mqttTopic) {
    const receivedCommand = message.toString();
    const currentDate = moment().tz('Asia/Kolkata');
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const formattedTime = currentDate.format('HH:mm:ss');

    if (receivedCommand === '1') {
      appStatus = 'on';
    } else {
      appStatus = 'off';
    }

    // Insert data into the SQLite database
    db.run(
      'INSERT INTO historic_data (date, time, command, status) VALUES (?, ?, ?, ?)',
      [formattedDate, formattedTime, receivedCommand, appStatus],
      (err) => {
        if (err) {
          console.error('Error inserting data into database:', err.message);
        } else {
          console.log('Data has been inserted into the database');
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
  // Retrieve data from the database and order by the most recent entries
  db.all('SELECT * FROM historic_data ORDER BY date DESC, time DESC', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving data from the database:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('historic-data', { rows: rows });
    }
  });
});



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
