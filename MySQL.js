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
		return [...gen(strings, values)].join('');
	}

	async sql(strings, ...values) {
		const query = this.parse(strings, values);
		return this.query(query);
	}
}

module.exports = MySQL;
