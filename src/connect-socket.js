import openSocket from 'socket.io-client';

import { NICE_SERVER_URL } from 'api';

const socket = openSocket(NICE_SERVER_URL);

export default socket;
