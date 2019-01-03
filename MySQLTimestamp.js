class MySQLTimestamp extends Date {
	toString() {
		const year = this.getUTCFullYear();
		const month = (this.getUTCMonth() + 1).toString().padStart(2, '0');
		const day = this.getUTCDate().toString().padStart(2, '0');
		const h = this.getUTCHours().toString().padStart(2, '0');
		const m = this.getUTCMinutes().toString().padStart(2, '0');
		const s = this.getUTCSeconds().toString().padStart(2, '0');
		return `${year}-${month}-${day} ${h}:${m}:${s}`;
	}
}

module.exports = MySQLTimestamp;
