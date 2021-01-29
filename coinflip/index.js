const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');

app.set("views", __dirname + "\\views");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    //res.send('Hello World!')
    res.render('index.html', {title:"CoinFlips"});
})



const Lobby = require('./lobby')


var gameData = {
    "WAGERS":[],
};




const wss = new WebSocket.Server({server:server});
wss.on('connection', function connection(ws){
    console.log(`Client Connected ${ws}!`)
    
    ws.on('message', function incoming(message){
        console.log("recieved: %s", message);

        const jsonMsg = JSON.parse(message);
        const code = jsonMsg.code;

        switch(code){
            case "NEW_WAGER":
                const lobby = new Lobby(jsonMsg.data, ws);
                gameData["WAGERS"].push(lobby);
                break;
            default:
                break;
        }

    });

});

function broadcastToAll(msg){
    wss.clients.forEach(ws => {
        ws.send(msg)
    });
}




server.listen(3000, () => {
    console.log(`Coinflips listening at http://localhost:${3000}`)
})