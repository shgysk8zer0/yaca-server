(async (configFile = './config.json') => {
	const WebSocket = require('ws');
	const http      = require('http');
	const readline  = require('readline');
	// const mysql     = require('mysql');
	const config    = require(configFile);

	async function* clients(config) {
		const socket = new WebSocket.Server(config.socket);
		http.createServer().on('upgrade', socket.handleUpgrade);

		console.log(`Listening on ${socket.options.host || '*'}:${socket.options.port}`);

		while(true) {
			const client1 = await new Promise(resolve => {
				socket.on('connection', (client1, {connection}) => {
					client1.connection = connection;
					// client1.send(JSON.stringify({message: 'Hello. How may I help you?', event: 'message'}));
					// client1.on('message', msg => console.log(JSON.parse(msg)));
					resolve(client1);
				});
			});

			const client2 = await new Promise(resolve => {
				socket.on('connection', (client2, {connection}) => {
					client2.connection = connection;
					// client2.on('message', msg => console.log(JSON.parse(msg)));
					resolve(client2);
				});
			});

			yield {client1, client2};
		}
	}

	for await ({client1, client2} of clients(config)) {
		// console.log({client1, client2});
		client1.on('message', msg => client2.send(msg));
		client1.on('close', () => client2.terminate());
		client2.on('message', msg => client1.send(msg));
		client2.on('close', () => client1.terminate());
	}
})();
