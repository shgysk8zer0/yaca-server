const WebSocket = require('./WebSocket.js');
const {createServer} = require('http');
const MySQL = require('./MySQL.js');
const {mysql, socket} = require('./config.json');
const MySQLTimestamp = require('./MySQLTimestamp.js');
const server = createServer();
const ws = new WebSocket(socket);
const db = new MySQL(mysql);

server.on('upgrade', ws.handleUpgrade);
console.log(`Listening on ${ws.options.host || '*'}:${ws.options.port}`);

Promise.resolve().then(async () => {
	for await (const [client1, client2] of ws.clientPairs()) {
		client1.on('message', async msg => {
			client2.send(msg);
			let {message, time} = JSON.parse(msg);
			time = new MySQLTimestamp(time);
			try {
				await db.sql`INSERT INTO \`messages\` (\`message\`, \`time\`) VALUES (${message}, ${time});`;
			} catch(err) {
				console.error(err);
			}
		});
		client1.on('close',   ()  => client2.close(1000, 'Other party exited'));
		client2.on('message', async msg => {
			client1.send(msg);
			let {message, time} = JSON.parse(msg);
			time = new MySQLTimestamp(time);
			try {
				await db.sql`INSERT INTO \`messages\` (\`message\`, \`time\`) VALUES (${message}, ${time});`;
			} catch(err) {
				console.error(err);
			}
		});
		client2.on('close',   ()  => client1.close(1000, 'Other party exited'));
	}
});
