const WebSocket  = require('./WebSocket.js');
const http       = require('http');
// const readline   = require('readline');
// const MySQL      = require('./MySQL.js');
const config     = require('./config.json');

const server     = http.createServer();
const socket     = new WebSocket(config.socket);
// const mysql      = new MySQL(config.mysql);

server.on('upgrade', socket.handleUpgrade);
console.log(`Listening on ${socket.options.host || '*'}:${socket.options.port}`);

(async socket => {
	let client = null;
	for await (client of socket.connections()) {
		client.send(JSON.stringify({message: 'Welcome to the party', event: 'message'}));
		socket.broadcast(JSON.stringify({message: 'Someone new has joined the party', event: 'message'}), client);
	}
})(socket);

(async socket => {
	let [client1, client2] = [null, null]; // Avoid linting error
	for await ([client1, client2] of socket.clientPairs()) {
		client1.on('message', msg => client2.send(msg));
		client1.on('close',   ()  => client2.close(1000, 'Other party exited'));
		client2.on('message', msg => client1.send(msg));
		client2.on('close',   ()  => client1.close(1000, 'Other party exited'));
	}
})(socket);
