        var chatbotPopup = document.getElementById("chatbot-popup");
        var chatDisplay = document.getElementById("chat-display");
        var userInput = document.getElementById("user-input");

        function toggleChatbot() {
            chatbotPopup.style.display = chatbotPopup.style.display === "block" ? "none" : "block";
        }

        function sendMessage(event) {
            if (event.type === "click" || (event.type === "keydown" && event.key === "Enter")) {
                var userInputValue = userInput.value.trim();
                if (userInputValue !== "") {
                    appendUserMessage(userInputValue);
                    sendUserMessage(userInputValue);
                }
            }
        }

        function appendUserMessage(message) {
            var userMessageDiv = document.createElement("div");
            userMessageDiv.textContent = "You: " + message;
            chatDisplay.appendChild(userMessageDiv);
            userInput.value = "";
        }

        function appendBotMessage(message) {
            var botMessageDiv = document.createElement("div");
            botMessageDiv.textContent = "Bot: " + message;
            chatDisplay.appendChild(botMessageDiv);
        }

        function sendUserMessage(message) {
            // Send the user's message to your chatbot script (bot.php)
            // You can use AJAX to make a request to your bot.php script.

            // Example using fetch (you may need to customize this part):
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'userMessage=' + encodeURIComponent(message),
            })
            .then(response => response.json())
            .then(data => {
                var botResponse = data.response;
                appendBotMessage(botResponse);
            })
            .catch(error => console.error(error));
        }
  
        var recognition;
        var voiceOutput = document.getElementById("voice-output");

        function startVoiceRecognition() {
            if ('webkitSpeechRecognition' in window) { // Check for browser support
                recognition = new webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onstart = function() {
                    voiceOutput.textContent = "Listening...";
                };

                recognition.onresult = function(event) {
                    var transcript = event.results[0][0].transcript;
                    voiceOutput.textContent = transcript;
                    sendUserMessage(transcript);
                };

                recognition.onend = function() {
                    voiceOutput.textContent = "Voice recognition ended";
                };

                recognition.start();
            } else {
                voiceOutput.textContent = "Voice recognition is not supported in your browser.";
            }
        }
  