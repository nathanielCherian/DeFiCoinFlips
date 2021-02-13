const { create } = require('domain');
const express = require('express');
const http = require("http");
const socketIO = require("socket.io");
var BITBOX = require('bitbox-sdk').BITBOX;
const bitbox = new BITBOX();
const createContract = require('./contract')
const RandomOracle = require('./oracle');



const port = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

const io = socketIO(server);

const oraclePair = createPairfromSeed("oracle");
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

        if(gameData[id].player1.pK && gameData[id].player2.pK){
            compileContract(gameData[id]);
        }
    }


    function compileContract(data){
        const c = createContract(data.player1.pK, data.player2.pK, bitbox.ECPair.toPublicKey(oraclePair))
        io.to(data.room).emit("add-contract", {contract:c});
    }

    socket.on('player-ready', (data)=>{
        const id = data.socketID;
        if(gameData[id].player1.socket == data.socket){
            gameData[id].player1.ready = true;
        }else if(gameData[id].player2.socket == data.socket){
            gameData[id].player2.ready = true;
        }

        if(gameData[id].player1.ready && gameData[id].player2.ready){
            startFlip(gameData[id]);
        }
    }); 

    function startFlip(data){
        const ro = new RandomOracle(oraclePair);
        const message = ro.createMessage(100,1);
        const sm = ro.signMessage(message);

        console.log('start flip');
        io.to(data.room).emit("start-flip", {outcome:1, signedMessage:sm});
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

function createPairfromSeed(seed){
    const bitbox = new BITBOX();
    const rootSeed = bitbox.Mnemonic.toSeed(seed);
    const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
    const pair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
    return pair;
}

server.listen(port, () => console.log(`Listening on port ${port}`));
