// Connect to the WebSocket server
const socket = io();

// Listen for status updates
socket.on('statusUpdate', function (status) {
  updateAppStatus(status); // Call the function to update status and toggle switch
});

// Function to update app status and toggle switch
function updateAppStatus(appStatus) {
  $('#appStatus').text('App Status: ' + appStatus);
  $('#toggleSwitch').prop('checked', appStatus === 'on');
}

$(document).ready(function () {
  // Initial update
  $.get('/app-status', function (data) {
    updateAppStatus(data.status);
  });

  $('#toggleSwitch').change(function () {
    const isChecked = $(this).is(':checked');
    const command = isChecked ? '1' : '0';
    $.post('/send-command', { command }, function (data) {
      console.log(data);

      // After sending command, update app status and toggle switch
      $.get('/app-status', function (data) {
        updateAppStatus(data.status);
      });
    });
  });
});
