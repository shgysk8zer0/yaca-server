const ws = require('ws');

class WebSocket extends ws.Server {
	async clientConnected() {
		return await new Promise(resolve => this.once('connection', resolve));
	}

	async getClientPair() {
		return await new Promise(async resolve => {
			let clients = [];
			while (clients.length === 0 || clients.length % 2 !== 0) {
				await this.clientConnected();
				clients = [...this.clients];
			}
			resolve(clients.slice(-2));
		});
	}

	async *clientPairs() {
		while(true) {
			yield await this.getClientPair();
		}
	}
}

module.exports = WebSocket;
