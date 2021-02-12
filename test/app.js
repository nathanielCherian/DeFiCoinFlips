const express = require('express');
const http = require("http");
const socketIO = require("socket.io");

const port = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

const io = socketIO(server);


const gameData = {};

io.on("connection", socket => {
    console.log("New client connected" + socket.id);

    socket.on("on-start", () => {
        console.log("started")
        socket.emit("get-all-data", gameData);
    });


    socket.on('create-wager', (wagerData)=>{
        gameData[socket.id] = wagerData;
        console.log(gameData);
    });


    socket.on("disconnect", () => {
        console.log("user disconnected");

    });

});


server.listen(port, () => console.log(`Listening on port ${port}`));
