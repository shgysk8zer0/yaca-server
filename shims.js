if (! Object.hasOwnProperty('fromEntries')) {
	Object.fromEntries = function(iterable) {
		return [...iterable].reduce((obj, [key, value]) => {
			obj[key] = value;
			return obj;
		}, {});
	};
}
