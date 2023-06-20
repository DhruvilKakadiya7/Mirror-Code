const express = require('express');
const app = express();
const http = require('http')
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);
const userSocketMap = {};
const getAllUsers = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            }
        }
    )
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const users = getAllUsers(roomId);
        console.log(users);
        users.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                users,
                username,
                socketId: socket.id,
            });
        });

    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on(ACTIONS.SYNC_INP_OUT_SEC,({inp,out,lang,running,socketId})=>{
        io.to(socketId).emit(ACTIONS.CUSTOM_INP_CHANGE,{custInp:inp});
        io.to(socketId).emit(ACTIONS.LANG_CHANGE,{lang});
        io.to(socketId).emit(ACTIONS.COMPILED,{outputRes:out});
        io.to(socketId).emit(ACTIONS.RUN_CHANGE,{running});
    })
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on(ACTIONS.MSG, ({ roomId, msg, name, time }) => {
        socket.in(roomId).emit("recive", { msg, name, time });
    });
    socket.on(ACTIONS.COMPILED,({outputRes, roomId})=>{
        socket.in(roomId).emit(ACTIONS.COMPILED,{outputRes});
    })
    socket.on(ACTIONS.RUN_CHANGE,({running,roomId})=>{
        socket.in(roomId).emit(ACTIONS.RUN_CHANGE,{running});
    })
    socket.on(ACTIONS.CUSTOM_INP_CHANGE,({custInp, roomId})=>{
        socket.in(roomId).emit(ACTIONS.CUSTOM_INP_CHANGE,{custInp});
    })
    socket.on(ACTIONS.LANG_CHANGE,({lang,roomId})=>{
        socket.in(roomId).emit(ACTIONS.LANG_CHANGE,{lang});
    })
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });


});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});