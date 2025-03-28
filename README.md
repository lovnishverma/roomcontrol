# Room Control System (Next-Gen Smart Home Automation)

## 🚀 Overview
The **Room Control System** is a **next-generation, open-source IoT-based automation platform** designed to **control and monitor electrical appliances in real-time**. Unlike traditional smart home systems, this solution is **cost-effective, cloud-independent, and fully customizable**—empowering users with **unparalleled control and security** over their smart environments. 

Built on a **modern tech stack** leveraging **MQTT, WebSockets, SQLite, and Express.js**, this system delivers **seamless automation, real-time feedback, and AI-driven voice control** without requiring proprietary apps like Alexa, Google Home, or Blynk IoT.

### 🌍 Revolutionizing IoT Automation
- **Completely Open-Source** – No hidden costs, full transparency, and complete control.
- **Independent & Decentralized** – Runs **without cloud dependency** for ultimate privacy.
- **AI-Enabled Voice Commands** – Issue commands directly using **built-in voice recognition**.
- **Self-Hosting Options** – Run it on **Raspberry Pi, VPS, or personal servers**.
- **Designed for Scalability** – Adaptable to **industrial automation, smart classrooms, and home automation**.

🔹 **Live Deployment:**  
🌐 **[Room Control (Live Demo)](https://roomcontrol.glitch.me/login)**  
📂 **[GitHub Repository](https://github.com/lovnishverma/roomcontrol)**  

**HOMEPAGE:**

![image](https://github.com/user-attachments/assets/de3e47d3-4a68-4458-bebc-0fa3dd9fcd90)

**VOICE CONTROL:**

![image](https://github.com/user-attachments/assets/523c4622-7c8d-4054-a5df-893767ab11d1)



## 🔥 Key Features
✅ **Real-Time Web Control** – Instant response via **WebSockets (Socket.IO)**.  
✅ **MQTT-Based IoT Communication** – Ultra-secure and efficient messaging.  
✅ **Historical Data Logging** – View **past actions, timestamps, and user activity**.  
✅ **End-to-End Security** – **bcrypt password hashing, session-based authentication**.  
✅ **AI-Powered Voice Control** – **No Alexa, No Google Home Needed!** Direct command execution.  
✅ **Automated Scheduling** – Predefine ON/OFF times for smart appliances.  
✅ **Mobile-Friendly UI** – Responsive and accessible from any device.  
✅ **Offline & Local Hosting Support** – Functions **without an internet connection**.  
✅ **Lightweight & Scalable** – Works on low-power devices like ESP8266 & ESP32.  

**Real-Time Historical Data:**

![image](https://github.com/user-attachments/assets/40585baa-0148-4642-8f9f-1994a9a626e6)


## 📌 Why This System is a Game-Changer
| **Existing Systems** | **Room Control System** |
|--------------------|-------------------|
| Requires External Apps (Alexa, Google Home, Blynk IoT) | No additional apps needed – **browser-based** control |
| Expensive Smart Hubs | Uses **affordable ESP8266/ESP32** modules |
| Cloud Dependent | Works **offline or online** (self-hosted) |
| Proprietary & Limited Customization | Fully **open-source** & highly customizable |
| IoT Vendor Lock-In | **Decentralized & user-controlled** |

## 🛠️ Technologies Used
- **Backend:** Express.js, SQLite
- **Frontend:** EJS, Bootstrap  
- **Communication Protocol:** MQTT, WebSockets  
- **Embedded:** ESP8266, HiveMQ Cloud MQTT  
- **Security:** bcrypt, express-session  

## 🏗️ Installation Guide
### Prerequisites
- Install **Node.js**
- Set up **ESP8266** with [Arduino IDE](https://www.arduino.cc/en/software/)
- Create an account with [HiveMQ Cloud MQTT](https://www.hivemq.com/)

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/lovnishverma/roomcontrol.git
cd roomcontrol
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and add:
```ini
MQTT_BROKER_URL=mqtts://your-hivemq-url
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
SESSION_SECRET=your-secret-key
```

### 4️⃣ Start the Server
```sh
npm start
```
Server will run at `http://localhost:3000`.

### 5️⃣ Deploying to a Live Server
- [Glitch](https://glitch.com/)
- [Heroku](https://www.heroku.com/)
- [Vercel](https://vercel.com/)

## ⚙️ ESP8266 Firmware Setup
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

🔹 **Full Code:** [ESP8266 Firmware](https://github.com/lovnishverma/roomcontrol/blob/master/esp8266_code.ino)

## 🌐 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/toggle-app?state=on` | GET | Turns the switch ON |
| `/toggle-app?state=off` | GET | Turns the switch OFF |
| `/app-status` | GET | Retrieves switch status |
| `/send-command` | POST | Sends command `{ command: '1'  '0' }` |
| `/historic-data` | GET | Retrieves historical data |

## 📡 WebSocket Events
- **`newEntry`** → Broadcasts new historical data
- **`statusUpdate`** → Sends real-time status updates

## 🔄 Future Enhancements

🚀 **[AR-Powered Automation](https://github.com/lovnishverma/arjs-iot-control)** – Integrate **Augmented Reality-based automation**.
🚀 **AI-Powered Automation** – Integrate **machine learning-based automation**.  
🚀 **Advanced Security** – Implement **OAuth 2.0 & JWT authentication**.  
🚀 **Multi-Device Synchronization** – Seamless control across multiple devices.  
🚀 **Smart Energy Management** – AI-powered power consumption analysis.  
🚀 **Native Mobile App (Flutter)** – Build an **offline-first PWA & mobile app**.  
🚀 **Raspberry Pi Support** – Run locally on a **self-hosted local server**.  

## 🎯 Contribution Guide
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-xyz`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to GitHub: `git push origin feature-xyz`
5. Submit a pull request.

## 🔗 Deployment & Hosting
📌 **Live Deployment:** [Room Control](https://roomcontrol.glitch.me/)  
📂 **GitHub Repository:** [Room Control](https://github.com/lovnishverma/roomcontrol)  
🔹 **Self-Hosting Options** – Raspberry Pi, VPS, or local servers.  

## 📝 License
This project is open-source under the **MIT License**. Feel free to **use, modify, and distribute**.

## 📖 Research Paper
This project is based on the research paper **[IoT-Based Remote Control and Monitoring of Electrical Appliances](https://journal.nielit.edu.in/index.php/01/article/view/107)**.

## 🤝 Contributors
- **Lovnish Verma** [(@lovnishVerma)](https://github.com/lovnishVerma)
- **Dr. Sarwan Singh** [(@sarwansingh)](https://github.com/sarwansingh)

## 📬 Contact
For any issues or queries, open an issue in the repository or contact: [princelv84@gmail.com](mailto:princelv84@gmail.com).

