const express = require('express')
const app = express()
const server = require('http').Server(app)
const PORT = process.env.PORT || 8000
const mqtt = require('mqtt')
const WebSocket = require('ws')
const ws = new WebSocket.Server({port: 8082})

app.use(express.static('public'))

ws.on('connection', socket => {
    console.log('client connected!')
    socket.on('close', () => console.log('client disconnect'))
    socket.on('message', msg => {
        ws.clients.forEach(function each(socketClient) {
            if (socketClient !== socket && socketClient.readyState === WebSocket.OPEN) {
              socketClient.send(msg.toString())
            }
        })
    })
})


let options = {
    host: '1a398270afa74ed49bee58f006c52c0f.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'komputerkerja100@gmail.com',
    password: 'Xilva2014pass'
}
let client = mqtt.connect(options);
client.on('connect', function () {
    console.log('Connected');
});
client.on('error', function (error) {
    console.log(error);
});
client.on('message', function (topic, message) {
    console.log('Received message:', topic, message.toString());
});
client.subscribe('my/test/topic');
client.publish('my/test/topic', 'Hello');

server.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))