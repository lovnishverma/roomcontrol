$(document).ready(function () {
  // Connect to the WebSocket server
  const socket = io();

  // Get a reference to the audio element
  const clickSound = document.getElementById('clickSound');

  // Load the audio
  clickSound.load();

  // Listen for status updates
  socket.on('statusUpdate', function (status) {
    updateAppStatus(status); // Call the function to update status and toggle switch
      // Play the click sound
    clickSound.play();
  });

  // Function to update app status and toggle switch
  function updateAppStatus(appStatus) {
    $('#appStatus').text('App Status: ' + appStatus);
    $('#toggleSwitch').prop('checked', appStatus === 'on');

    // Update body background color based on the switch status
    if (appStatus === 'on') {
      document.body.style.backgroundColor = 'yellow'; // Change to desired color
    } else {
      document.body.style.backgroundColor = 'grey'; // Change to desired color
    }
  }

  $('#toggleSwitch').change(function () {
    const isChecked = $(this).is(':checked');
    const command = isChecked ? '1' : '0';

    // Emit the toggleSwitch event to the server
    socket.emit('toggleSwitch', isChecked);

    $.post('/send-command', { command }, function (data) {
      console.log(data);

      // After sending command, update app status and toggle switch
      $.get('/app-status', function (data) {
        updateAppStatus(data.status);
      });
    });
  });

  // Initial update
  $.get('/app-status', function (data) {
    updateAppStatus(data.status);
  });
});

const toggleSwitch = document.getElementById('toggleSwitch');
        const audio = document.getElementById('audio');

        // Initialize the SpeechRecognition API
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;

        // Add a function to toggle the switch based on voice commands
        const toggleApp = (state) => {
            const url = `https://mqttnodejs.glitch.me/toggle-app?state=${state}`;
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                      
                    }
                    return response.text();
                })
                .then(data => {
                    console.log(`Swith ${state} ho gya hai`);
              
                    // Play click sound when the switch is toggled
                    speak(`Switch ${state} ho gaya hai ji`);
                    audio.play();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

        // Add voice recognition for toggle commands
        recognition.onresult = function(event) {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('Voice input:', transcript);

            if (transcript.includes('turn on') || transcript.includes('on')) {
                toggleSwitch.checked = true;
                toggleApp('on');
            } else if (transcript.includes('turn off') || transcript.includes('off')) {
                toggleSwitch.checked = false;
                toggleApp('off');
            } else if (transcript.includes('check status') || transcript.includes('app status') || transcript.includes('status')) {
        checkStatus();
            }
          else if (transcript.includes('developer')) {
        speak('इस ऐप के डेवलपर Lovnish Verma है');
    } else if (transcript.includes('hello')) {
        speak('हां भाई जी, बोलो क्या हो गया?');
    } else if (transcript.includes('how are you') || transcript.includes('kya haal hai')) {
        speak('मैं ठीक हूं, धन्यवाद! आपका कैसे सहाय्य कर सकता हूं?');
    } else if (transcript.includes('tell me a joke') || transcript.includes('joke')) {
        speak('बिल्कुल! ये raha एक jabardast चुटकुला: क्या आपको पता है, एक जानवर होता है जो केवल बहुत अच्छे फोटोज़ खिचवाता है? वो aapp ho!');
    } else if (transcript.includes('thank you')) {
        speak('कोई बात नहीं, आपका स्वागत है!');
    } else if (transcript.includes('smart')) {
        speak('सबसे होशियार व्यक्ति तो आप हैं!');
    } else if (transcript.includes('fact')) {
        speak('जानकारी के लिए एक मजेदार तथ्य: कुछ बिल्लियां हाथी की तरह दौड़ सकती हैं!');
    } else if (transcript.includes('life')) {
        speak('जीवन का अर्थ है खुशियों और साझा करने में!');
    } else if (transcript.includes('love')) {
        speak('love you too ji');
    }   
          else {
        speak('मुझे माफ़ करें, मैं इस कमांड को समझ नहीं पाया।');
    }
        };

        // Function to check app status
        const checkStatus = () => {
            fetch('https://mqttnodejs.glitch.me/app-status')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const appStatus = data.status;
                    const appStatusText = document.getElementById('appStatus'); // Get the appStatus element
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
        };

        // Function to speak a message
        const speak = (message) => {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(message);
            synth.speak(utterance);
        };

        // Start continuous recognition
        recognition.start();

$(document).ready(function () {
            // Your existing JavaScript code here

            // Function to start voice recognition
            const startRecognition = () => {
                recognition.start();
                console.log('Voice recognition started');
            };

            // Add click event listener to the "Start Voice Recognition" button
            const startButton = document.getElementById('startVoiceRecognition');
            startButton.addEventListener('click', startRecognition);
        });