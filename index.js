(async (configFile = './config.json') => {
	const WebSocket  = require('./WebSocket.js');
	const http       = require('http');
	const readline   = require('readline');
	// const mysql      = require('mysql');
	const config     = require(configFile);
	const socket = new WebSocket(config.socket);
	const server = http.createServer();
	server.on('upgrade', socket.handleUpgrade);
	console.log(`Listening on ${socket.options.host || '*'}:${socket.options.port}`);

	for await ([client1, client2] of socket.clientPairs()) {
		client1.on('message', msg => client2.send(msg));
		client1.on('close',   ()  => client2.close(1000, 'Other party exited'));
		client2.on('message', msg => client1.send(msg));
		client2.on('close',   ()  => client1.close(1000, 'Other party exited'));
	}
})();
