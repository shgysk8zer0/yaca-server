(async ({username, password}) => {
	const User = require('./User.js');
	const user = new User();
	return user.login({username, password});
})({
	username: 'user4@example.com',
	password: 'my-password-123',
}).then(({username, created, loggedIn}) => {
	console.log({username, created, loggedIn});
	process.exit(0);
}).catch(error => {
	console.error(error);
	process.exit(1);
});
