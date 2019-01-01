(async ({username, password}) => {
	const bcrypt = require('bcryptjs');
	const mysql = require('mysql');

	function mySqlDate(date = new Date()) {
		const year = date.getUTCFullYear();
		const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
		const day = date.getUTCDate().toString().padStart(2, '0');
		const h = date.getUTCHours().toString().padStart(2, '0');
		const m = date.getUTCMinutes().toString().padStart(2, '0');
		const s = date.getUTCSeconds().toString().padStart(2, '0');
		return `${year}-${month}-${day} ${h}:${m}:${s}`;
	}

	class User {
		constructor(configFile = './config.json', key = 'mysql') {
			this.db = mysql.createConnection(require(configFile)[key]);
			this.db.connect();
			this.id = NaN;
			this.username = null;
			this.created = null;
			this.loggedIn = false;
		}

		async query(strings, ...values) {
			const db = this.db;
			function* gen(strs, vals) {
				let si = 0;
				let vi = 0;
				const len = strs.length + vals.length;
				for (let i = 0; i < len; i++) {
					if (i % 2 === 0) {
						yield strs[si++];
					} else {
						yield db.escape(vals[vi++]);
					}
				}
			}

			const sql = [...gen(strings, values)].join('');
			return new Promise((resolve, reject) => {
				this.db.query(sql, function(error, results) {
					if (error instanceof Error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			});
		}

		async register({username, password, created = new Date(), rounds = 10}) {
			try {
				const hash = await bcrypt.hash(password, rounds);
				const result = await this.query`INSERT INTO \`users\` (
					\`username\`,
					\`password\`,
					\`created\`
				) VALUES (
					${username},
					${hash},
					${mySqlDate(created)}
				);`;


				if (result.affectedRows === 1) {
					this.username = username;
					this.created = created;
					this.id = result.insertId;
					this.loggedIn = true;
				}
			} catch (error) {
				console.error(error);
			}

			return this;
		}

		async login({username, password}) {
			try {
				const users = await this.query`SELECT \`username\`,
					\`password\` AS \`hash\`,
					\`created\`
					FROM \`users\`
					WHERE \`username\` = ${username}
					LIMIT 1;`;
				if (Array.isArray(users) && users.length === 1) {
					if (bcrypt.compare(password, users[0].hash)) {
						const {username, created} = users[0];
						this.username = username;
						this.created = created;
						this.loggedIn = true;
					} else {
						throw new Error('User not found or password does not match');
					}
				}
			} catch(error) {
				console.error(error);
			}
			return this;
		}
	}

	const user = new User();
	return user.login({username, password});
})({
	username: 'user4@example.com',
	password: 'my-password-123',
}).then(({username, created, loggedIn}) => {
	console.log({username, created, loggedIn});
	process.exit(0);
}).catch(error => {
	console.error(error);
	process.exit(1);
});
