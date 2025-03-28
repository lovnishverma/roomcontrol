# Room Control System

## Overview
The **Room Control System** is a fully **open-source IoT-based web application** designed to **control and monitor electrical appliances in real time**. Built using **MQTT, SQLite, WebSockets, and EJS**, it provides **seamless control, automation, and real-time feedback** via a web interface. Unlike proprietary smart home platforms, this system is designed to be **low-cost, highly customizable, and free from third-party dependencies** such as Blynk IoT, Alexa, or Google Home.  

With **secure user authentication**, **historical logging**, and **voice command support**, this system is ideal for **home automation, smart classrooms, research projects, and industrial control applications**. The lightweight architecture ensures it runs efficiently on **ESP8266-based IoT devices** while allowing easy integration with **local or cloud-based MQTT brokers**.  

### 🔹 Current Deployment:
- **MQTT Broker:** [HiveMQ Cloud](https://www.hivemq.com/)  
- **Frontend & Backend Hosting:** [Glitch](https://glitch.com/) (Node.js)  
- **Database:** SQLite  

Designed with **flexibility in mind**, the system can be **self-hosted** on a Raspberry Pi, personal server, or cloud platforms like **Glitch, Heroku, or AWS**, making it a scalable and future-proof solution for IoT automation. 🚀  

---

[Live Demo](https://roomcontrol.glitch.me/login) | [GitHub Repository](https://github.com/lovnishverma/roomcontrol) 😊

## Features
- **Real-time Control & Monitoring:** Users can toggle the relay switch remotely.
- **Web-Based Dashboard:** Access historical control data through an intuitive web interface.
- **MQTT Communication:** Secure communication with the ESP8266-based relay module.
- **User Authentication:** Secure login for authorized control.
- **Historical Logging:** Keeps a log of all switch actions with timestamps and usernames.
- **Voice Control:** Supports voice commands (`ON`, `OFF`, `STATUS`) without requiring external assistants.
- **Automated Scheduling:** Set predefined schedules for lights to turn ON/OFF automatically.
- **Open-Source & Customizable:** Modify and extend functionalities as needed.
- **Local Hosting Option:** Can function without cloud dependency.

## Problems with Existing Systems
- **Require External Apps:** Many existing smart home systems require users to install mobile applications, which can be inconvenient.
- **Expensive Smart Home Hubs:** Voice-controlled systems often depend on costly devices like Amazon Alexa or Google Home.
- **Proprietary Hardware Costs:** Most smart home systems use expensive, proprietary components, making them less accessible.
- **Limited Customization:** Many commercial IoT solutions do not allow customization or modification.
- **Cloud Dependency:** Many smart home systems stop working if cloud services go down.

## Advantages of the Proposed System
- **Web-Based Control:** No need to install any external app; access control via a browser.
- **No Alexa/Google Home Required:** Built-in voice command support without additional AI assistant devices.
- **Affordable Hardware:** Uses an ESP8266 module, significantly reducing costs.
- **Independent of Cloud Services:** Can be hosted locally for offline usage.
- **Fully Open-Source:** Encourages contributions, modifications, and self-hosting.

## Technologies Used
- **Backend:** Express.js, SQLite, MQTT
- **Frontend:** EJS, Bootstrap, WebSockets
- **Embedded:** ESP8266, HiveMQ Cloud MQTT
- **Security:** bcrypt for password hashing, express-session for authentication

## Hardware Requirements
- **ESP8266 NodeMCU Module**
- **AC to DC Power Adapter**
- **Relay Module**
- **Buzzer**
- **Jumper Wires**

## Installation Guide
### Prerequisites
- Install **Node.js**
- Set up **ESP8266** with [Arduino IDE](https://www.arduino.cc/en/software/)
- Create an account with [HiveMQ Cloud MQTT](https://www.hivemq.com/)

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
Deploy the system to platforms like:
- [Glitch](https://glitch.com/)
- [Heroku](https://www.heroku.com/)
- [Vercel](https://vercel.com/)

## ESP8266 Firmware Setup
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

## Contribution Guide
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-xyz`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to GitHub: `git push origin feature-xyz`
5. Submit a pull request.

## Deployment & Hosting
The project is live at **[Room Control](https://roomcontrol.glitch.me/)**.
- GitHub Repository: [arjs-iot-control](https://github.com/lovnishverma/arjs-iot-control)
- Self-hosting options available for Raspberry Pi, VPS, or local servers.

## License
This project is open-source under the **MIT License**. Feel free to use, modify, and distribute.

## Research Paper
This project is based on the research paper **[IoT-Based Remote Control and Monitoring of Electrical Appliances](https://journal.nielit.edu.in/index.php/01/article/view/107)**.

## Contributors
- **Lovnish Verma** [(@lovnishVerma)](https://github.com/lovnishVerma)
- **Dr. Sarwan Singh** [(@sarwansingh)](https://github.com/sarwansingh)

## Contact
For any issues or queries, open an issue in the repository or contact: [princelv84@gmail.com](mailto:princelv84@gmail.com).

