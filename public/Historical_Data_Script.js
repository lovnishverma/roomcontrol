// scripts.js
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
    `;
    document.querySelector('tbody').prepend(newRow);
  });

  socket.on('disconnect', function() {
    console.log('Socket disconnected');
  });
});
