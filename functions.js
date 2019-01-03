function mySqlTimestamp(date = new Date()) {
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const h = date.getUTCHours().toString().padStart(2, '0');
	const m = date.getUTCMinutes().toString().padStart(2, '0');
	const s = date.getUTCSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${h}:${m}:${s}`;
}

module.exports.mySqlTimestampmySqlTimestamp = mySqlTimestamp;
