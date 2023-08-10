const mqtt = require('mqtt');
const readline = require('readline');

// MQTT broker configuration
const brokerUrl = 'mqtt://broker.hivemq.com'; // Update with your broker's URL
const mqttTopic = 'mytopic/nielit';
const qos = 0;
const clientId = 'nodejs-client';

// Set up MQTT client
const client = mqtt.connect(brokerUrl, { clientId });

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Callback when connected to MQTT broker
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(mqttTopic, { qos });
});

// Function to publish a message to control the ESP8266 device
function sendCommand(command) {
  client.publish(mqttTopic, command.toString(), { qos }); // Send the command as a message
}

// Read user input and send commands
rl.question('Enter a command (0 for OFF, 1 for ON): ', (command) => {
  if (command === '0' || command === '1') {
    sendCommand(command);
  } else {
    console.log('Invalid command. Use 0 for OFF, 1 for ON.');
  }
  rl.close();
});
