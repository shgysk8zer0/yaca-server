(async (...args) => {
	const WebSocket = require('ws');
	const http      = require('http');
	const readline  = require('readline');

	class Socket extends WebSocket.Server {
		constructor(...args) {
			super(...args);
		}

		static async connect(server = http.createServer(), ...args) {
			const socket = new Socket(...args);
			server.on('upgrade', socket.handleUpgrade);
			console.log(`Listening on ${socket.options.host || '*'}:${socket.options.port}`);
			const rl = readline.createInterface(process.stdin, process.stdout);
			socket.on('connection', client => {
				console.log('New connection established');
				client.send(JSON.stringify({message: 'Hello. How may I help you?', event: 'message'}));
				rl.on('line', txt => client.send(JSON.stringify({message: txt, event: 'message'})));
				rl.on('close', () => process.exit(0));
				client.on('message', msg => {
					try {
						const {time, event, text} = JSON.parse(msg);
						const date	= new Date(time);
						switch(event) {
						case 'message':
							console.log(`[${date.toLocaleString()}] ${text}`);
							break;
						default: throw new Error(`Unhandled event: "${event}"`);
						}
					} catch (err) {
						console.error(err);
					}
				});
			});
			return socket;
		}
	}

	Socket.connect(http.createServer(), ...args);
})({
	port: 3000,
});
