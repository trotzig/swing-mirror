const express = require('express');
const app = express();

const port = 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

io.sockets.on('error', e => console.log(e));
server.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);

let broadcaster;

io.sockets.on('connection', socket => {
  console.log('connection established');
  socket.on('broadcaster', () => {
    console.log('broadcaster', socket.id);
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', (...args) => {
    console.log('watcher', socket.id, args);
    socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });

  socket.on('offer', (id, message) => {
    console.log('offer', socket.id, message);
    socket.to(id).emit('offer', socket.id, message);
  });
  socket.on('answer', (id, message) => {
    console.log('answer', socket.id, message);
    socket.to(id).emit('answer', socket.id, message);
  });
  socket.on('candidate', (id, message) => {
    console.log('candidate', socket.id, message);
    socket.to(id).emit('candidate', socket.id, message);
  });
});
