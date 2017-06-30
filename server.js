// server.js

const express = require('express');
const WebSocket=require('ws');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      let newMessage=JSON.parse(data);
      newMessage['id']=uuidv1();
      client.send(JSON.stringify(newMessage));
    }
  });
};

wss.broadcastClientsCount=function broadcastClientsCount(){
  console.log("Current clients are "+wss.clients.size);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      let newMessage={};
      newMessage['type']='clientsCount';
      newMessage['count']=wss.clients.size;
      newMessage['id']=uuidv1();
      //console.log("user count : "+newMessage.count);
      console.log(JSON.stringify(newMessage));
      client.send(JSON.stringify(newMessage));
    }
  });
}

wss.broadcastClientsCount();
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  wss.broadcastClientsCount();
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    wss.broadcastClientsCount();
    console.log('Client disconnected');
    console.log("There are "+wss.clients.size+" users online");
  });
  ws.on('message',function incoming(data){
    console.log("incoming data type is ",typeof data);
    console.log("incoming data is ",data);
    wss.broadcast(data);
    wss.broadcastClientsCount();
  });
});

