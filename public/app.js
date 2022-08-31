
const socket = new WebSocket('ws://' + location.hostname + ':8082')
let urlObject;

socket.onopen = () => console.log('connect to server sucess!')
socket.onmessage = message => {
    const arrayBuffer = message.data;
    if(urlObject){
        URL.revokeObjectURL(urlObject);
    }
    urlObject = URL.createObjectURL(new Blob([arrayBuffer]));
    img.src = urlObject;
}

send.addEventListener('click', e => {
    if(send.innerText == "Open Camera"){
        send.innerText = "Close Camera"
        socket.send("start")
    }else{
        socket.send("stop")
        send.innerText = "Open Camera"
    }
})