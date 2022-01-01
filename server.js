const crypto = require('crypto');
const http = require('http');

const express = require('express');
const next = require('next');

const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const io = require('socket.io')(server);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandle = nextApp.getRequestHandler();

const broadcasters = {
  // mapping id => socketId
};

app.use((req, res, next) => {
  if (!dev) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

io.sockets.on('error', e => console.error(e));

nextApp.prepare().then(() => {
  server.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`),
  );

  app.get('/watch', (req, res, next) => {
    const { broadcastId } = req.query;
    if (!broadcasters[broadcastId]) {
      res.status(404);
      nextApp.render(req, res, '/', { broadcastId, error: 'not_found' });
      return;
    }
    nextApp.render(req, res, '/watch', { broadcastId });
  });

  app.get('*', (req, res) => {
    return nextHandle(req, res);
  });

  io.sockets.on('connection', socket => {
    socket.on('broadcaster', event => {
      broadcasters[event.broadcastId] = socket.id;
      socket.broadcast.emit('broadcaster');
    });
    socket.on('watcher', event => {
      const broadcaster = broadcasters[event.broadcastId];
      if (broadcaster) {
        socket.to(broadcaster).emit('watcher', socket.id);
      }
    });
    socket.on('disconnect', event => {
      for (const socketId of Object.values(broadcasters)) {
        socket.to(socketId).emit('disconnectPeer', socket.id);
      }
      for (const broadcastId of Object.keys(broadcasters)) {
        if (broadcasters[broadcastId] === socket.id) {
          delete broadcasters[broadcastId];
        }
      }
    });

    socket.on('instruction', (id, instruction) => {
      socket.to(id).emit('instruction', socket.id, instruction);
    });
    socket.on('offer', (id, message) => {
      socket.to(id).emit('offer', socket.id, message);
    });
    socket.on('answer', (id, message) => {
      socket.to(id).emit('answer', socket.id, message);
    });
    socket.on('candidate', (id, message) => {
      socket.to(id).emit('candidate', socket.id, message);
    });
  });
});
