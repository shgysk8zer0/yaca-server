class Headers extends Map {
	constructor(headers = {}) {
		super(Object.entries(headers));
		delete this.forEach;
	}

	set(key, value) {
		super.set(key.toLowerCase(), value);
	}

	get(key) {
		return super.get(key.toLowerCase());
	}

	has(key) {
		return super.has(key.toLowerCase());
	}
}

module.exports = Headers;
