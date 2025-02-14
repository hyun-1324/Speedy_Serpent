import { io, Socket } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000';

export const socket: Socket = io(URL, { autoConnect: false });