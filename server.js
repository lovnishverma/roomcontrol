const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 3000;

// MQTT broker configuration
const brokerUrl = 'mqtt://broker.hivemq.com'; // Update with your broker's URL
const mqttTopic = 'mytopic/nielit';
const qos = 0;

const client = mqtt.connect(brokerUrl);

let appStatus = 'off'; // Initialize app status

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from "public" directory

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(mqttTopic, { qos });
});

client.on('message', (topic, message) => {
  if (topic === mqttTopic) {
    const receivedCommand = message.toString();
    if (receivedCommand === '1') {
      appStatus = 'on';
    } else {
      appStatus = 'off';
    }
  }
});

app.post('/send-command', (req, res) => {
  const command = req.body.command;
  client.publish(mqttTopic, command.toString(), { qos });

  // Update app status based on command
  if (command === '1') {
    appStatus = 'on';
  } else {
    appStatus = 'off';
  }

  res.send(`Command sent: ${command}`);
});

// Route to get the app status
app.get('/app-status', (req, res) => {
  res.json({ status: appStatus });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
