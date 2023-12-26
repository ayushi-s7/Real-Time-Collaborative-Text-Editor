const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var editor_text="";
var noofclient=0;
var offset;
var ip_range= [
  ["", ""],
  ["", ""],
  ["", ""]
];
var ip_range_demo= [
  [":ffff:192.168.233.64", ":ffff:192.168.233.64"],
  ["::1", "::ffff:127.0.0.1"],
  ["", ""]
];

let ip_editor = new Set();
let ip_viewer = new Set();

function ipToDecimal(ip) {
  var octets = ip.split('.');
  var binaryRepresentation = octets.map(function (octet) {
  var binary = parseInt(octet, 10).toString(2);
    var paddedBinary = '00000000'.substring(binary.length) + binary;
    return paddedBinary;
  }).join('');
  var decimalNumber = parseInt(binaryRepresentation, 2);
  return decimalNumber;
}

function checkIpAddress(inputIp, startIp, endIp) {
  var inputDecimal = ipToDecimal(inputIp);
  var startDecimal = ipToDecimal(startIp);
  var endDecimal = ipToDecimal(endIp);
  var isInRange = inputDecimal >= startDecimal && inputDecimal <= endDecimal;
  return isInRange;
}



function decode(text){
  var newalpha = "";
    for (let i = 0; i < text.length; i++){
      if(i%2==0){
        newalpha += String.fromCharCode(Math.abs(text.charCodeAt(i)-offset-1)%256);
      }
      else{
        newalpha += String.fromCharCode(Math.abs(text.charCodeAt(i)-offset+1)%256);
      }
      
    }
    return newalpha;
}

app.use(express.static(path.join(__dirname, 'private')));
app.post('/process',(req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.get('*', (req,res) => {
    if(noofclient==0){
      res.sendFile(path.join(__dirname, 'public', 'form.html'));
      noofclient++;
    }
    else{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    
  }
  });

io.on('connection', (socket) => {

    var clientIP = socket.handshake.address;
    console.log(clientIP!=="::1");
    console.log(clientIP!=="::ffff:127.0.0.1");
    if(!(clientIP!=="::1" && clientIP!=="::ffff:127.0.0.1")){
        socket.emit('updated',editor_text,offset);
        ip_editor.add(clientIP);
        console.log("editor",ip_editor);
    }
    else{
        socket.emit('view',editor_text,offset);
        ip_viewer.add(clientIP);
        console.log("view",ip_viewer);
    }
  io.emit('view_update', Array.from(ip_viewer));
  io.emit('edit_update', Array.from(ip_editor));

  socket.on('redirect',(text,off)=>{
    ip_range=text;
    offset=off;
    console.log(ip_range,offset);
    // socket.emit('redirect',1);
  })
  socket.on('update', (text) => {
    editor_text=text;
    io.emit('updated', editor_text,offset);
  });

  socket.on('disconnect', () => {
    ip_editor.delete(clientIP);
    ip_viewer.delete(clientIP);
    io.emit('view_update', Array.from(ip_viewer));
    io.emit('edit_update', Array.from(ip_editor));
    console.log('User disconnected');
  });
  

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});