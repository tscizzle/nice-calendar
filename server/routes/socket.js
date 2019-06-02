const socketRoutes = ({ io }) => {
  io.on('connection', socket => {
    // --- subscribe a logged-in user to real-time updates for only them
    if (socket.request.user) {
      const userId = socket.request.user._id;
      socket.join(userId);
    }
  });
};

module.exports = socketRoutes;
