(async ({username, password}) => {
	const bcrypt = require('bcryptjs');
	const mysql = require('mysql');

	class User {
		constructor(configFile = './config.json', key = 'mysql') {
			this.db = mysql.createConnection(require(configFile)[key]);
			this.db.connect();
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
				this.db.query(sql, (results, error) => {
					if (error instanceof Error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			});
		}

		async register({username, password, created = new Date(), rounds = 10}) {
			const hash = await bcrypt.hash(password, rounds);
			const result = await this.query`INSERT INTO \`users\` (
				\`username\`,
				\`password\`,
				\`created\`
			) VALUES (
				${username},
				${hash},
				${created.toISOString()}
			);`;

			return result;
		}

		async login({username, password}) {
			const users = this.query`SELECT \`password\` AS \`hash\` FROM \`users\` WHERE \`username\` = ${username} LIMIT 1;`;
			return bcrypt.compare(password, users[0].hash);
		}
	}

	const user = new User();
	return user.register({username, password});
	// const userData = await user.register({username, password});
	// return userData;
})({
	username: 'shgysk8zer0@gmail.com',
	password: 'my-password-123',
}).then(user => {
	console.log(user);
	process.exit(0);
}).catch(error => {
	console.error(error);
	process.exit(1);
});
