require('dotenv').config()
const {WebSocket} = require('ws'); 
const {v4: uuidv4} = require('uuid');

const socket = new WebSocket.Server({port: process.env.WS_PORT},()=>{
    console.log('WebSocket start on '+process.env.WS_PORT)
})

const clients = {};
const comand = {};
let clientId; 

socket.on('connection', (ws,req) =>{
    console.log('Nueva conexion al websocket')
    ws.on('message', data =>{
        data = JSON.parse(data);
        clientId = data.id
        console.log('Cliente: '+ clientId)
        clients[clientId] = ws;
    });
    ws.onerror = function (err){
        console.log(err)
    }
    ws.on('close', ()=>{
        delete clients[clientId]
        console.log('Conexion del cliente ' +clientId+' cerrada');
    });
});   



module.exports = {clients}