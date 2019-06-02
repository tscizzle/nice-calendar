import openSocket from 'socket.io-client';

import { NICE_SERVER_URL } from 'api';

const connectSocket = () => {
  const socket = openSocket(NICE_SERVER_URL);
  return socket;
};

export default connectSocket;
