document.addEventListener('DOMContentLoaded', function() {
  const socket = io();

  socket.on('connect', function() {
    console.log('Socket connected');
  });

 socket.on('newEntry', function(entry) {
  console.log('New entry received:', entry);
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.time}</td>
    <td>${entry.command}</td>
    <td>${entry.status}</td>
    <td>${entry.username}</td>
  `;
  document.querySelector('tbody').prepend(newRow);
});


  socket.on('disconnect', function() {
    console.log('Socket disconnected');
  });

  const darkModeToggle = document.getElementById('darkModeToggle');
  const deleteDataButton = document.getElementById('deleteDataButton');

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
  });

  deleteDataButton.addEventListener('click', async () => {
    const confirmDelete = confirm('Are you sure you want to delete all historic data? This action cannot be undone.');
    if (confirmDelete) {
      try {
        const response = await fetch('/delete-data', { method: 'POST' });
        if (response.ok) {
          alert('Historic data deleted successfully.');
          location.reload();
        } else {
          alert('An error occurred while deleting data.');
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('An error occurred while deleting data.');
      }
    }
  });
});
