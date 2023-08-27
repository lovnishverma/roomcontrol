$(document).ready(function () {
  // Create an audio element
  const clickSound = new Audio('https://cdn.glitch.global/08e63b66-17e6-4a37-b447-cb3acf6954ba/click.mp3?v=1693077805076');

  // Load the audio
  clickSound.load();

  // Play the sound when the switch status changes
  clickSound.play().catch(error => {
    console.error('Audio playback failed:', error);
  });
});



$(document).ready(function () {
  // Initial update
  $.get('/app-status', function (data) {
    updateAppStatus(data.status);
  });

  $('#toggleSwitch').change(function () {
    const isChecked = $(this).is(':checked');
    const command = isChecked ? '1' : '0';

    // Emit the toggleSwitch event to the server with the username
    socket.emit('toggleSwitch', { isChecked, username: '<%= username %>' });

    $.post('/send-command', { command }, function (data) {
      console.log(data);

      // After sending command, update app status and toggle switch
      $.get('/app-status', function (data) {
        updateAppStatus(data.status);

        // Play the click sound after user interaction
        playClickSound();
      });
    });
  });

  // Connect to the WebSocket server
  const socket = io();

  // Function to play the click sound
  function playClickSound() {
    const clickSound = document.getElementById('clickSound');
    clickSound.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }

  // Listen for status updates
  socket.on('statusUpdate', function (status) {
    updateAppStatus(status); // Call the function to update status and toggle switch
  });

  // Function to update app status and toggle switch
  function updateAppStatus(appStatus) {
    $('#appStatus').text('Switch Status: ' + appStatus);
    $('#toggleSwitch').prop('checked', appStatus === 'on');

    // Update body background color based on the switch status
    if (appStatus === 'on') {
      document.body.style.backgroundColor = 'yellow'; // Change to desired color
    } else {
      document.body.style.backgroundColor = 'grey'; // Change to desired color
    }
  }
});
