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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from "public" directory

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

app.post('/send-command', (req, res) => {
  const command = req.body.command;
  client.publish(mqttTopic, command.toString(), { qos });
  res.send(`Command sent: ${command}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
