function updateAppStatus() {
  $.get('/app-status', function (data) {
    const appStatus = data.status;

    // Update the app status text
    $('#appStatus').text('App Status: ' + appStatus);

    // Update the toggle switch based on app status
    if (appStatus === 'on') {
      $('#toggleSwitch').prop('checked', true);
    } else {
      $('#toggleSwitch').prop('checked', false);
    }
  });
}

$(document).ready(function () {
  updateAppStatus(); // Initial update

  $('#toggleSwitch').change(function () {
    const isChecked = $(this).is(':checked');
    const command = isChecked ? '1' : '0';
    $.post('/send-command', { command }, function (data) {
      console.log(data);
      updateAppStatus(); // Update app status and toggle switch after sending command
    });
  });
});
