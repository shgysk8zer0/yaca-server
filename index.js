(async ({port = 3000} = {}) => {
	const WebSocket = require('ws');
	const http = require('http');
	const readline = require('readline');
	const server = http.createServer();

	class Socket extends WebSocket.Server {
		constructor({port = 3000} = {}) {
			super({port});
			this.socket = null;
		}

		async connect() {
			return new Promise(resolve => {
				this.on('connection', ws => {
					const rl = readline.createInterface(process.stdin, process.stdout);
					this.socket = ws;
					rl.on('line', txt => this.send({message: txt, event: 'message'}));
					rl.on('close', () => process.exit(0));
					ws.on('message', msg => {
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
					this.socket = ws;
					resolve(this);
				});
			});
		}

		send({message = '', event = 'message'} = {}) {
			this.socket.send(JSON.stringify({message, event}));
		}

		message(message) {
			this.send({message, event: 'message'});
		}

		ping() {
			this.send({event: 'ping'});
		}
	}
	const socket = new Socket({port});
	server.on('upgrade', socket.handleUpgrade);
	console.log(`Listening on port ${port}`);
	const client = await socket.connect();
	console.log('New connection established');
	client.message('Hello. How may I help you?');
})();
