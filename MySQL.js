const {createConnection} = require('mysql');

class MySQL extends createConnection {
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
}

module.exports = MySQL;
