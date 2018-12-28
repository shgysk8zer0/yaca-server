(async (configFile = './config.json') => {
	const WebSocket = require('ws');
	const http      = require('http');
	const readline  = require('readline');
	const mysql     = require('mysql');
	const config    = require(configFile);

	class Socket extends WebSocket.Server {
		constructor(...args) {
			super(...args);
		}

		static async connect(server = http.createServer(), ...args) {
			const socket = new Socket(...args);
			const db     = mysql.createConnection(config.mysql);

			db.config.queryFormat = function(query, values) {
				if (!values) return query;
				return query.replace(/:(\w+)/g, (txt, key) => {
					if (values.hasOwnProperty(key)) {
						return this.escape(values[key]);
					}
					return txt;
				});
			};

			db.connect();
			server.on('upgrade', socket.handleUpgrade);
			console.log(`Listening on ${socket.options.host || '*'}:${socket.options.port}`);
			const rl = readline.createInterface(process.stdin, process.stdout);

			socket.on('connection', (client, con) => {
				const ip = con.connection.remoteAddress;
				console.log('New connection established');
				client.send(JSON.stringify({message: 'Hello. How may I help you?', event: 'message'}));

				rl.on('line', txt => client.send(JSON.stringify({message: txt, event: 'message'})));
				rl.on('close', () => process.exit(0));

				client.on('message', msg => {
					try {
						const {time, event, text} = JSON.parse(msg);
						const date	= new Date(time);
						const timestamp = Date.parse(date);

						switch(event) {
						case 'message':
							db.query(
								'INSERT INTO `messages` (`text`, `timestamp`,`ip`) VALUES (:text, :timestamp, :ip)',
								{text, timestamp, ip}
							);
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

	Socket.connect(http.createServer(), config.socket);
})();
