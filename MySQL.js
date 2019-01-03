/**
 * @see https://github.com/mysqljs/mysql
 */

const mysql = require('mysql');
class MySQL {
	constructor(...args) {
		this.db = mysql.createConnection(...args);
		this.connect();
	}

	connect() {
		this.db.connect();
	}

	end(...args) {
		this.db.end(...args);
	}

	escape(...args) {
		return this.db.escape(...args);
	}

	async query(...args) {
		return new Promise((resolve, reject) => {
			this.db.query(...args, (error, results) => {
				if (error instanceof Error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

	parse(strings, ...values) {
		const db = this;
		function* gen(strs, vals) {
			let i = 0;

			while (strs[i] || vals[i]) {
				if (strs[i]) {
					yield strs[i];
				}
				if (vals[i]) {
					yield db.escape(vals[i]);
				}
				i++;
			}
		}

		const query = [...gen(strings, values)].join('');
		return query;
	}

	async sql(strings, ...values) {
		const query = this.parse(strings, ...values);
		return this.query(query);
	}

	async insert(table, values = {}) {
		table = `\`${table}\``;
		const keys = Object.keys(values).map(key => `\`${key}\``);
		const vals = Object.values(values).map(val => this.escape(val));
		const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${vals.join(', ')});`;
		return await this.query(query);
	}
}

module.exports = MySQL;
