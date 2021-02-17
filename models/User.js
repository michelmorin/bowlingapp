const mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// Create Shema
const UserSchema = new Schema({
	username     : {
		type     : String,
		required : true
	},
	googleID     : String,
	facebookID   : String,
	email        : String,
	name         : {
		type     : String,
		required : true
	},
	image        : {
		type    : String,
		default : '/img/defaultuser.jpg'
	},
	created      : {
		type    : Date,
		default : Date.now
	},
	lastSignedIn : {
		type    : Date,
		default : Date.now
	}
});

UserSchema.plugin(passportLocalMongoose);

const { body } = require('express-validator/check');

// Create collection and add schema
module.exports = mongoose.model('users', UserSchema);
