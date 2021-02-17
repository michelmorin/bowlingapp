var mongoose = require('mongoose');
var User = require('../models/User');

var data = [
	{
		username     : 'michel',
		googleid     : '123',
		email        : 'michelmorin77@gmail.com',
		name         : 'Lordataum',
		image        : '/img/defaultuser.jpg',
		created      : Date.now,
		lastSignedIn : Date.now
	}
];

function seedDB() {
	//Remove all campgrounds
	User.remove({}, function(err) {
		if (err) {
			console.log(err);
		}
		console.log('Removed all users!');
		//add a few campgrounds
		data.forEach(function(seed) {
			User.create(seed, function(err, user) {
				if (err) {
					console.log(err);
				} else {
					console.log('added a user');
				}
			});
		});
	});
}

module.exports = seedDB;
