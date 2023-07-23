if (!global.app) return;
/** SOCKET IO */
const { Server } = require('socket.io');
const io = new Server(global.server);

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sys.sessionMiddleware));

module.exports = { io };
