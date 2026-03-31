import {Server} from 'socket.io';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        },
    });

    console.log('Socket.io server is running');

    io.on('connection', (socket) => {
        console.log('a user connected : ' + socket.id);
        // socket.on('disconnect', () => {
        //     console.log('user disconnected');
        // });
    });
}

export function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}