const MySQL = require('./MySQL.js');
const bcrypt = require('bcryptjs');

function mySqlDate(date = new Date()) {
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const h = date.getUTCHours().toString().padStart(2, '0');
	const m = date.getUTCMinutes().toString().padStart(2, '0');
	const s = date.getUTCSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${h}:${m}:${s}`;
}

class User extends MySQL {
	constructor(...args) {
		super(...args);
		this.connect;
		this.id = NaN;
		this.username = null;
		this.created = null;
		this.loggedIn = false;
	}

	async register({username, password, created = new Date(), rounds = 10}) {
		try {
			const hash = await bcrypt.hash(password, rounds);
			const result = await this.sql`INSERT INTO \`users\` (
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
			const users = await this.sql`SELECT \`username\`,
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

module.exports = User;
