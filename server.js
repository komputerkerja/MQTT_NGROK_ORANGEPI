require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').Server(app)
const PORT = process.env.PORT || 8000
const mqtt = require('mqtt')
const WebSocket = require('ws')
const ws = new WebSocket.Server({port: 8082})
const ngrok = require('ngrok')

const ngrokConnect = async () => {
    const ngrokOptions = {
        proto: 'tcp',
        addr: 22,
        authtoken:process.env.NGROK_TOKEN
    }
    console.log('requesting tunnel...')
    const url = await ngrok.connect(ngrokOptions)
    console.log(`url: ${url}`)
    return url
}
const ngrokDisconnect = async () =>  {
    await ngrok.disconnect()
    await ngrok.kill()
    console.log('disconnected!')
    return 'disconnected!'
}

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
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    protocol: process.env.MQTT_PROTOCOL,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
}
let client = mqtt.connect(options);
client.on('connect', function () {
    console.log('Connected');
});
client.on('error', function (error) {
    console.log(error);
});
client.on('message', async function(topic, message) {
    if(message.toString() == "connect"){
        const conn = await ngrokConnect();
        client.publish('xilva/orangePi/pub/', conn);        
    }else if(message.toString() == "disconnect"){
        const dis = await ngrokDisconnect();
        client.publish('xilva/orangePi/pub/', dis);
    }
    console.log(message.toString())
});
client.subscribe('xilva/orangePi/sub/');
client.publish('xilva/orangePi/pub/', 'Hello from orange pi');

server.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))