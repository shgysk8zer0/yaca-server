const ws = require('ws');

class WebSocket extends ws.Server {
	get clientsArray() {
		return [...this.clients];
	}

	find(search) {
		return this.clientsArray.find(client => client === search);
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
		while(true) {
			yield await this.getClientSet(2);
		}
	}
}

module.exports = WebSocket;
