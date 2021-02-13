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
        createWager(wagerData);
    });

    socket.on('join-wager', (data)=>{
        joinWager(data);
    });

    
    //room specific now


    socket.on('send-pK', (data)=>{
        setWagerData(data);
    }); 


    function setWagerData(data){
        const id = data.socketID;
        if(gameData[id].player1.socket == data.socket){
            gameData[id].player1.pK = data.pK;
        }else if(gameData[id].player2.socket == data.socket){
            gameData[id].player2.pK = data.pK;
        }
    }

    //end room specific 



    socket.on("disconnect", () => {
        console.log("user disconnected");
        removeWager();
    });


    function joinWager(data){
        data.open = false;
        gameData[data.socketID].player2 = data.player2;
        io.emit("wager-joined", gameData[data.socketID]);

        io.to(gameData[data.socketID].room).emit("room-message", {'msg':"Player Joined!"});
        socket.join(gameData[data.socketID].room);
        io.to(gameData[data.socketID].room).emit("room-update", gameData[data.socketID]);
    }

    function createWager(wagerData){
        gameData[socket.id] = wagerData;
        io.emit("new-wager", wagerData);

        gameData[socket.id]['room'] = "wager-"+socket.id;
        socket.join(gameData[socket.id].room);
        io.to(gameData[wagerData.socketID].room).emit("room-update", gameData[wagerData.socketID]);
    }

    function removeWager(){
        delete gameData[socket.id];
        io.emit("remove-wager", {socketID:socket.id});
    }

});


server.listen(port, () => console.log(`Listening on port ${port}`));
