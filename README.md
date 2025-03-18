# Room Control System

## Overview
Express.js application that interacts with MQTT for sending and receiving commands, stores historical data in a SQLite database, and communicates with clients using Socket.IO for real-time updates. No Refresh Web Sockets Dynamic Responsive Nodejs app built with NodeJS, MQTT, SQLLITE instantly up and Controling smart Home.
The **Room Control System** is a web-based application designed to control the **solar lights** in **Room No. 212, NIELIT Chandigarh Ropar Campus**. It is built using **Express.js, MQTT, SQLite, WebSockets, and EJS** for rendering dynamic web pages. 
The system is **hosted live at:** [Room Control](https://roomcontrol.glitch.me/).


![image](https://github.com/user-attachments/assets/8f57326f-4c63-4de8-9d38-3f43c372ed12)

![image](https://github.com/user-attachments/assets/faeb76e3-091a-49d5-a802-763dcacf2baa)

![image](https://github.com/user-attachments/assets/433e4874-f79b-4b61-82bf-d0417d490a24)


## Features
- **User Authentication** (Login & Registration using bcrypt and SQLite)
- **Real-time Control** of room lights via **MQTT**
- **WebSockets** for real-time status updates
- **Historical Data Logging** with **SQLite**
- **Secure Session Handling** using `express-session`
- **Automated Scheduling** using `node-cron`
- **Live Status Monitoring** via API

## Technologies Used
- **Backend:** Node.js, Express.js, MQTT
- **Database:** SQLite
- **Frontend:** EJS, Bootstrap
- **WebSockets:** socket.io
- **Task Scheduling:** node-cron
- **Authentication:** bcrypt, express-session

## Installation
### Prerequisites
Ensure you have **Node.js** installed on your machine.

### Clone the Repository
```bash
git clone https://github.com/lovnishverma/roomcontrol.git
cd roomcontrol
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env` file and add the following:
```
PORT=3000
MQTT_BROKER_URL=mqtt://your-mqtt-broker
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
SESSION_SECRET=your-session-secret
```

### Run the Server
```bash
node server.js
```
Server will start on `http://localhost:3000`

## MQTT Communication
The system subscribes to the MQTT topic **`212`** and processes messages as follows:
- **Message `1`** → Light **ON**
- **Message `0`** → Light **OFF**

## API Endpoints
- **Send Command:** `POST /send-command` (Body: `{ command: '1' | '0' }`)
- **Get Status:** `GET /app-status`
- **View Historical Data:** `GET /historic-data`
- **Toggle Light:** `GET /toggle-app?state=on | off`

## WebSocket Events
- **`newEntry`** → Broadcasts new historical data
- **`statusUpdate`** → Sends real-time light status updates

## Deployment
This project is hosted live at **[Room Control](https://roomcontrol.glitch.me/)** on Glitch.
Connected Project **[arjs-iot-control](https://github.com/lovnishverma/arjs-iot-control/blob/master/README.md)** on Github.

## License
This project is open-source under the **MIT License**.

## Research Paper
The project is based on the research paper **[IoT-Based Remote Control and Monitoring of Electrical Appliances](https://journal.nielit.edu.in/index.php/01/article/view/107)**.

## Contributors
- **Lovnish Verma** [(@lovnishVerma)](https://github.com/lovnishVerma)
- **Dr. Sarwan Singh** [(@sarwansingh)](https://github.com/sarwansingh)
- **Jaskirat Singh**
- **Digvir Singh**

## Contact
For any issues, please open an issue in the repository or contact [princelv84@gmail.com](mailto:princelv84@gmail.com).

