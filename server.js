const path = require('path');
const http = require('http')
const express = require('express');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const ChatApp = require("./utils/mongo");
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const userName = 'Admin';

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome message
        socket.emit('message', formatMessage(userName, 'Welcome to MyChatApp!'));
        socket.broadcast.to(user.room).emit('message', formatMessage(userName, `${user.username} has  joined the chat`));

        // To send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });





    // To send message to everyone
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    // To leave chat
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(userName, `${user.username} has left the chat`));
            // To send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

        }
    })
});

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
    console.log("Connected to database!");
    const PORT = process.env.PORT || 2000;

    server.listen(PORT, () => console.log(`server is listening on port ${PORT}`));
});