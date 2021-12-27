const express = require('express');
const app = express();

const port = 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

io.sockets.on('error', e => console.log(e));
server.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);

app.get('/:broadcastId', (req, res, next) => {
  res.render('watch', req.params);
});

const broadcasters = {
  // mapping id => socketId
};

io.sockets.on('connection', socket => {
  socket.on('broadcaster', event => {
    console.log('broadcaster', event, socket.id);
    broadcasters[event.broadcastId] = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', event => {
    console.log('watcher', event, socket.id);
    const broadcaster = broadcasters[event.broadcastId];
    if (broadcaster) {
      socket.to(broadcaster).emit('watcher', socket.id);
    }
  });
  socket.on('disconnect', (event) => {
    console.log('disconnect', socket.id);
    for (const socketId of Object.values(broadcasters)) {
      socket.to(socketId).emit('disconnectPeer', socket.id);
    }
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
