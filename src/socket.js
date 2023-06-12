import {io} from 'socket.io-client'

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
        upgrade: true,
    };
    return io('http://localhost:5000/', options);
};
