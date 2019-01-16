const {getCerts} = require('./functions.js');

getCerts({
	keyFile: 'yaca.key',
	certFile: 'yaca.cert',
}).then(async ({key, cert}) => {
	const WebSocket = require('./WebSocket.js');
	require('./shims.js');
	const http = require('https');
	// const Headers = require('./Headers.js');
	const server1 = http.createServer({key, cert});
	const server2 = http.createServer({key, cert});
	server1.listen(3000);
	server2.listen(3001);
	// const MySQL = require('./MySQL.js');
	// const {/*mysql, */socket} = require('./config.json');
	// const MySQLTimestamp = require('./MySQLTimestamp.js');
	// const db = new MySQL(mysql);
	// const server = http.createServer();
	// server.listen(8080);
	const ws = new WebSocket({server: server1});
	const ws2 = new WebSocket({server: server2});

	// async function parsePOST(req) {
	// 	let body = '';
	// 	return new Promise(resolve => {
	// 		req.on('data', chunk => body += chunk.toString());
	// 		req.on('end', () => resolve(JSON.parse(body)));
	// 	});
	// }

	async function* connections(ws1, ws2) {
		ws1.on('connection', () => console.log(`New connection on socket 1. # = ${[...ws1.clients].length}`));
		ws2.on('connection', () => console.log(`New connection on socket 2. # = ${[...ws2.clients].length}`));
		while (true) {
			let client1, client2, paired = false;
			while (! paired) {
				try {
					client1 = client1 || await ws1.getAvailable();
					client1.once('close', () => client1 = undefined);
					client2 = client2 || await ws2.getAvailable();
					client2.once('close', () => client2 = undefined);
					paired = WebSocket.clientAvailable(client1) &&  WebSocket.clientAvailable(client2);
				} catch (err) {
					console.error(err);
				}
			}
			client1.available = false;
			client2.available = false;
			// client1.once('close', () => client1.available = true);
			// client2.once('close', () => client1.available = true);
			yield [client1, client2];
		}
	}

	// server.listen(8080);
	// const mysql      = new MySQL(config.mysql);

	// server.on('request', async (req, resp) => {
	// 	const headers = new Headers(req.headers);
	// 	const url = new URL(req.url, `${req.connection.encrypted ? 'https' : 'http'}://${headers.get('host')}`);
	// 	const get = Object.fromEntries(url.searchParams.entries());
	// 	const post = await parsePOST(req);
	// 	const respHeaders = new Headers();
	// 	const bod = {url, get, post, method: req.method, headers, Accept: headers.get('Accept')};
	// 	console.log(bod);
	// 	respHeaders.set('Content-Type', 'application/json');
	// 	[...respHeaders.entries()].forEach(([key, val]) => resp.setHeader(key, val));
	// 	resp.end(JSON.stringify(bod));
	// });

	// server.on('upgrade', ws.handleUpgrade);
	console.log(`Listening on ${ws.options.host || '*'}:${ws.options.port || ws.options.server.port}`);

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
		client1.once('close',   ()  => client2.close(1000, 'Other party exited'));
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
