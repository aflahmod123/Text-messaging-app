const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const formatMessage = require("./utils/messages")
const {userJoin,getCurrentUser,getRoomUsers,userLeave } = require("./utils/users")

const botName = "Robot "

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket =>{
    socket.on('joinRoom', ({username,room}) =>{

      const user = userJoin(socket.id,username,room);
      socket.join(user.room);

        socket.emit('message', formatMessage(botName,'Welcome to Discord Rip Off'));
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} Has Joined the chat`));
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
})
    console.log("New Websocket Has Been Connected");


    socket.on('disconnect', () =>{
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} Has Left The Chat`));
            
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    socket.on('chatMessage',msg =>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    
    })
})
console.log(formatMessage)
const Port = 5500 || process.env.Port;

server.listen(Port, () => console.log(`Server Is running on port ${Port}`));