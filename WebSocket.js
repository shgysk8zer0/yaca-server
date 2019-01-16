const ws = require('ws');

function connected(client) {
	return typeof client.readyState === 'number' && client.readyState === client.OPEN;
}

class WebSocket extends ws.Server {
	constructor(...args) {
		super(...args);
		this.on('connection', client => {
			this.setAvailability(client, true);
			Object.defineProperty(client, 'connected', {
				get: () => connected(client),
			});

			client.message = async data => client.send(JSON.stringify(data));

			client.prompt = async (text, initial) => {
				return await new Promise(resolve => {
					client.message({event: 'prompt', text, initial});
					client.once('message', resolve);
				});
			};
		});
	}

	static clientConnected(client) {
		return client.hasOwnProperty('OPEN') && typeof client.OPEN === 'number' && client.readyState === client.OPEN;
	}

	static clientAvailable(client) {
		return WebSocket.clientConnected(client) && client.available === true;
	}

	get clientsArray() {
		return [...this.clients];
	}

	get onlineClients() {
		return this.clientsArray.filter(client => client.readyState === client.OPEN);
	}

	get availableClients() {
		return this.onlineClients.filter(client => client.available === true);
	}

	find(search) {
		return this.clientsArray.find(client => client === search);
	}

	setAvailability(client, available) {
		const found = this.clientsArray.find(cl => cl === client);
		if (found !== undefined) {
			found.available = available;
			client.available = available;
		} else {
			throw new Error('Cannot find that client');
		}
	}

	async getAvailable() {
		const avail = this.availableClients;
		return avail.length === 0 ? await this.connection() : avail[0];
	}

	broadcast(msg, ...except) {
		this.onlineClients.forEach(client => {
			if (except.length === 0 || ! except.includes(client)) {
				client.send(msg);
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
