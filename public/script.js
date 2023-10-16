$(document).ready(function () {
  // Initialize the SpeechRecognition API
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;

  // Get references to the toggleSwitch and audio elements
  const toggleSwitch = document.getElementById('toggleSwitch');
  const audio = document.getElementById('audio');
  const startButton = document.getElementById('startVoiceRecognition');
  const appStatusText = document.getElementById('appStatus');

  // Variables to keep track of recognition status
  let isRecognitionActive = false;

  // Handle continuous recognition errors
  recognition.onerror = function (event) {
    console.error('Voice recognition error:', event.error);
  };

  // Handle recognition start
  recognition.onstart = function () {
    isRecognitionActive = true;
    startButton.textContent = 'Stop Voice Recognition';
    console.log('Voice recognition started');
  };

  // Handle recognition end
  recognition.onend = function () {
    isRecognitionActive = false;
    startButton.textContent = 'Start Voice Recognition';
    console.log('Voice recognition ended');
  };

  // Toggle voice recognition
  function toggleRecognition() {
    if (isRecognitionActive) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }

  // Add click event listener to the "Start/Stop Voice Recognition" button
  startButton.addEventListener('click', toggleRecognition);

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRecognitionActive) {
      recognition.stop();
    }
  });

  // Connect to the WebSocket server
  const socket = io();

  // Get a reference to the audio element
  const clickSound = document.getElementById('clickSound');

  // Load the audio
  clickSound.load();

  // Handle continuous recognition results
  recognition.onresult = function (event) {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log('Voice input:', transcript);

    // Implement your voice command handling here

    // For example:
    if (transcript.includes('turn on') || transcript.includes('on')) {
      toggleSwitch.checked = true;
      toggleApp('on');
    } else if (transcript.includes('turn off') || transcript.includes('off')) {
      toggleSwitch.checked = false;
      toggleApp('off');
    } else if (transcript.includes('check status') || transcript.includes('app status') || transcript.includes('status')) {
      checkStatus();
    }

    // Add more voice command handling as needed
  };

  // Function to toggle the switch based on voice commands
  function toggleApp(state) {
    const url = `https://mqttnodejs.glitch.me/toggle-app?state=${state}`;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        console.log(`Switch ${state} ho gaya hai`);
        // Play click sound when the switch is toggled
        speak(`Switch ${state} ho gaya hai ji`);
        audio.play();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  // ...
  // Function to check app status
  function checkStatus() {
    fetch('https://mqttnodejs.glitch.me/app-status')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const appStatus = data.status;
        if (appStatusText) {
          appStatusText.textContent = `App Status: ${appStatus}`;
          speak(`iss samay switch ka status ${appStatus} hai ji`);
        } else {
          console.error('appStatusText element not found');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
// ...

  // Function to speak a message
  function speak(message) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    synth.speak(utterance);
  }

  // Handle browser visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRecognitionActive) {
      recognition.stop();
    }
  });

  // Initial update
  $.get('/app-status', function (data) {
    updateAppStatus(data.status);
  });
});
