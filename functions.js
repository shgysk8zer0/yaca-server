const fs = require('fs');

function mySqlTimestamp(date = new Date()) {
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const h = date.getUTCHours().toString().padStart(2, '0');
	const m = date.getUTCMinutes().toString().padStart(2, '0');
	const s = date.getUTCSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${h}:${m}:${s}`;
}

async function read(file, {encoding = 'utf-8', flag = 'r'} = {}) {
	return await new Promise((resolve, reject) => {
		fs.readFile(file, {encoding, flag}, (err, data) => {
			if (err instanceof Error) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

async function getCerts({keyFile, certFile}) {
	const [key, cert] = await Promise.all([read(keyFile), read(certFile)]);
	return {key, cert};
}

module.exports.mySqlTimestampmySqlTimestamp = mySqlTimestamp;
module.exports.read = read;
module.exports.getCerts = getCerts;
