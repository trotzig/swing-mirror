const crypto = require('crypto');

const next = require('next');

const express = require('express');
const app = express();

const port = process.env.PORT || 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandle = nextApp.getRequestHandler();

const broadcasters = {
  // mapping id => socketId
};

app.use((req, res, next) => {
  if (`${port}` === '80' && !req.secure) {
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

  app.get('/', (req, res, next) => {
    res.render('index');
  });

  app.get('/broadcast', (req, res, next) => {
    res.render('broadcast', {
      broadcastId: crypto.randomBytes(2).toString('hex'),
    });
  });

  app.get('/watch', (req, res, next) => {
    const { broadcastId } = req.query;
    if (!broadcasters[broadcastId]) {
      return res
        .status(404)
        .render('index', { ...req.query, error: 'not_found' });
    }
    res.render('watch', req.query);
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
