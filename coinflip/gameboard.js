const Chance = require('chance');
const { json } = require('express');
const Lobby = require('./lobby');

class GameBoard{

    constructor({wss}){
        this.lobbies = {};
        this.wss = wss;
    }


    addLobby(){
        var id = Chance.string({length:5});
        while(id in Object.keys(this.lobbies)){
            id = Chance.string({length:5});
        }

        const lobby = new Lobby();

        this.lobbies[id] = lobby;

    }


    broadcastToAll(code, dict){
        const msg = JSON.stringify({code:dict});
        this.wss.clients.forEach((client) => {
            client.sen
        });

    }


}