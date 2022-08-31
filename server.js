require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').Server(app)
const PORT = process.env.PORT || 80
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
    console.log('client connect')
    socket.onclose = () => console.log('client leaved')
    socket.onmessage = msg => {
        ws.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(msg.data);
            }
        })
    }
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