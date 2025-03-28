# Room Control System

## Overview
The **Room Control System** is an IoT-based web application designed to control and monitor electrical appliances. The system uses **MQTT, SQLite, WebSockets, and EJS** to provide real-time control and automation.


[Live Demo](https://roomcontrol.glitch.me/login)

## Features
- **Real-time Control & Monitoring:** Users can toggle the relay switch remotely.
- **Web Dashboard:** View historical control data with a user-friendly interface.
- **MQTT Communication:** Secure communication with the ESP8266-based relay module.
- **User Authentication:** Only authorized users can control the system.
- **Historical Logging:** Logs all switch actions with timestamps and usernames.
- **Voice Control:** Users can say "ON" or "OFF" to control the switch.
- **Automated Scheduling:** Lights can be turned ON/OFF based on predefined schedules.

## Problems with Existing Systems
- **Require External Applications:** Many smart home systems require users to install additional mobile apps, making it inconvenient.
- **Dependency on Alexa/Google Home:** Existing systems often require expensive smart home hubs like Amazon Alexa or Google Home for voice control.
- **Expensive Hardware:** Most smart home solutions use costly proprietary hardware, increasing the cost of setup.
- **Limited Customization:** Many commercial IoT solutions have restricted customization options, making modifications difficult.
- **Cloud Dependency:** Most existing systems rely heavily on cloud services, making them unusable if the cloud service goes down.

## Advantages of This System
- **Web-Based Control:** No need to install any external application—just use a web browser to control devices.
- **No Need for Alexa/Google Home:** Built-in voice command support without requiring expensive AI assistants.
- **Low-Cost Hardware:** Uses an affordable ESP8266 module for communication, making it cost-effective.
- **Local Hosting:** Can be hosted on a local server, eliminating dependency on cloud services.
- **Open-Source & Customizable:** Fully open-source, allowing users to modify and extend features as needed.

## Technologies Used
- **Backend:** Express.js, SQLite, MQTT
- **Frontend:** EJS, Bootstrap
- **Embedded:** ESP8266, HiveMQ Cloud MQTT
- **Security:** bcrypt for password hashing, express-session for authentication

## Installation
### Prerequisites
- Node.js installed
- ESP8266 module with Arduino IDE setup
- [HiveMQ Cloud MQTT broker](https://www.hivemq.com/)

### 1. Clone the Repository
```sh
 git clone https://github.com/lovnishverma/roomcontrol.git
 cd roomcontrol
```

### 2. Install Dependencies
```sh
 npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add:
```ini
MQTT_SERVER=your-mqtt-server
MQTT_PORT=8883
MQTT_USER=your-mqtt-username
MQTT_PASSWORD=your-mqtt-password
SESSION_SECRET=your_secret_key
```

### 4. Start the Server
```sh
 npm start
```
The server will start at `http://localhost:3000`.

### 5. Deploying to a Live Server
You can deploy the system to a live server like [Glitch](https://glitch.com/) or [Heroku](https://www.heroku.com/).

## ESP8266 Firmware
### Wiring
- **Relay Module:** GPIO 4 (D2)
- **Buzzer:** GPIO 5 (D1)

### Wi-Fi & MQTT Configuration
```cpp
const char* ssid = "your_wifi_SSID";
const char* password = "your_wifi_password";
const char* mqttServer = "your-mqtt-server";
const int mqttPort = 8883;
const char* mqttUser = "your-mqtt-username";
const char* mqttPassword = "your-mqtt-password";
```
Upload the firmware using Arduino IDE.

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/toggle-app?state=on` | GET | Turns the switch ON |
| `/toggle-app?state=off` | GET | Turns the switch OFF |
| `/app-status` | GET | Retrieves the switch status |
| `/send-command` | POST | Sends command `{ command: '1' | '0' }` |
| `/historic-data` | GET | Retrieves historical data |

## MQTT Communication
The system subscribes to the MQTT topic **`212`** and processes messages as follows:
- **Message `1`** → Light **ON**
- **Message `0`** → Light **OFF**

## WebSocket Events
- **`newEntry`** → Broadcasts new historical data
- **`statusUpdate`** → Sends real-time light status updates

## Contribution
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-xyz`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to GitHub: `git push origin feature-xyz`
5. Open a pull request.

## Deployment
This project is hosted live at **[Room Control](https://roomcontrol.glitch.me/)** on Glitch.

Connected Project: **[arjs-iot-control](https://github.com/lovnishverma/arjs-iot-control/blob/master/README.md)** on GitHub.

## License
This project is open-source under the **MIT License**.

## Research Paper
The project is based on the research paper **[IoT-Based Remote Control and Monitoring of Electrical Appliances](https://journal.nielit.edu.in/index.php/01/article/view/107)**.

## Contributors
- **Lovnish Verma** [(@lovnishVerma)](https://github.com/lovnishVerma)
- **Dr. Sarwan Singh** [(@sarwansingh)](https://github.com/sarwansingh)

## Contact
For any issues, please open an issue in the repository or contact [princelv84@gmail.com](mailto:princelv84@gmail.com).

