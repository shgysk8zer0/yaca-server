const ws = require('ws');

class WebSocket extends ws.Server {
	constructor(...args) {
		super(...args);
		this.on('connection', client => {
			client.message = (async data => {
				client.send(JSON.stringify(data), {}, (...args) => console.log(args));
			});
		});
	}
	get clientsArray() {
		return [...this.clients];
	}

	find(search) {
		return this.clientsArray.find(client => client === search);
	}

	broadcast(msg, ...except) {
		this.clients.forEach(client => {
			if (client.readyState === client.OPEN) {
				if (except.length === 0 || ! except.includes(client)) {
					client.send(msg);
				}
			}
		});
	}

	async connection() {
		return await new Promise(resolve => this.once('connection', resolve));
	}

	async getClientSet(size = 2) {
		return await new Promise(async resolve => {
			let clients = [];
			while (clients.length === 0 || clients.length % size !== 0) {
				await this.connection();
				clients = this.clientsArray;
			}
			resolve(clients.slice(-size));
		});
	}

	async *connections() {
		while(true) {
			yield await this.connection();
		}
	}

	async *clientPairs() {
		while (true) {
			yield await this.getClientSet(2);
		}
	}
}

module.exports = WebSocket;
