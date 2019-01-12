const WebSocket = require('./WebSocket.js');
const Headers = require('./Headers.js');
const http = require('http');
// const MySQL = require('./MySQL.js');
// const {/*mysql, */socket} = require('./config.json');
// const MySQLTimestamp = require('./MySQLTimestamp.js');
// const db = new MySQL(mysql);
require('./shims.js');
const server = http.createServer();
// server.listen(8080);
const ws = new WebSocket({port: 3000});
const ws2 = new WebSocket({port: 3001});

async function parsePOST(req) {
	let body = '';
	return new Promise(resolve => {
		req.on('data', chunk => body += chunk.toString());
		req.on('end', () => resolve(JSON.parse(body)));
	});
}

async function* connections(...sockets) {
	while (true) {
		const clients = await Promise.all(sockets.map(async socket => await socket.connection()));
		if (clients.every(client => client.readyState === client.OPEN)) {
			yield clients;
		} else {
			clients.forEach(client => client.close(1011, 'Connection failed'));
		}
	}
}

// server.listen(8080);
// const mysql      = new MySQL(config.mysql);

server.on('request', async (req, resp) => {
	const headers = new Headers(req.headers);
	const url = new URL(req.url, `${req.connection.encrypted ? 'https' : 'http'}://${headers.get('host')}`);
	const get = Object.fromEntries(url.searchParams.entries());
	const post = await parsePOST(req);
	const respHeaders = new Headers();
	const bod = {url, get, post, method: req.method, headers, Accept: headers.get('Accept')};
	console.log(bod);
	respHeaders.set('Content-Type', 'application/json');
	[...respHeaders.entries()].forEach(([key, val]) => resp.setHeader(key, val));
	resp.end(JSON.stringify(bod));
});

server.on('upgrade', ws.handleUpgrade);
console.log(`Listening on ${ws.options.host || '*'}:${ws.options.port}`);

Promise.resolve().then(async () => {
	for await (const [client1, client2] of connections(ws, ws2)) {
		client1.send(JSON.stringify({event: 'paired'}));
		client2.send(JSON.stringify({event: 'paired'}));
		client1.on('message', async msg => {
			client2.send(msg);
			// let {message, time} = JSON.parse(msg);
			// time = new MySQLTimestamp(time);
			// try {
			// 	await db.sql`INSERT INTO \`messages\` (\`message\`, \`time\`) VALUES (${message}, ${time});`;
			// } catch(err) {
			// 	console.error(err);
			// }
		});
		client1.on('close',   ()  => client2.close(1000, 'Other party exited'));
		client2.on('message', async msg => {
			client1.send(msg);
			// let {message, time} = JSON.parse(msg);
			// time = new MySQLTimestamp(time);
			// try {
			// 	await db.sql`INSERT INTO \`messages\` (\`message\`, \`time\`) VALUES (${message}, ${time});`;
			// } catch(err) {
			// 	console.error(err);
			// }
		});
		client2.on('close',   ()  => client1.close(1000, 'Other party exited'));
	}
});
