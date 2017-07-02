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

/*
* Function to broadcast new message to all users
* If websocket is open, create a unique id using uuidv1 package for the message and then
* send the message in JSON format to all clinets
*/
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      let newMessage=JSON.parse(data);
      newMessage['id']=uuidv1();
      client.send(JSON.stringify(newMessage));
    }
  });
};

/*
* Function to broadcast client count to all users
* Broadcasted message is in JSON format with a unique id assigned
*/
wss.broadcastClientsCount=function broadcastClientsCount(){
  console.log("Current clients are "+wss.clients.size);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      let newMessage={};
      newMessage['type']='clientsCount';
      newMessage['count']=wss.clients.size;
      newMessage['id']=uuidv1();
      client.send(JSON.stringify(newMessage));
    }
  });
}

wss.broadcastClientsCount();
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

  //On connection, boradcast how many clients are online.
  wss.broadcastClientsCount();
  // Broadcast client count when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    wss.broadcastClientsCount();
  });

  //When there is an incoming emssage from websoket server, broadcast message and broadcast client count
  //data: incoming message
  ws.on('message',function incoming(data){
    wss.broadcast(data);
  });
});

