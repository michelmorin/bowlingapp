const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');
// Load user model
const User = mongoose.model('users');

module.exports = function(passport) {
	passport.use(
		new GoogleStrategy(
			{
				clientID     : keys.googleClientID,
				clientSecret : keys.googleClientSecret,
				callbackURL  : keys.googleCallbackURL,
				proxy        : true
			},
			(accessToken, refreshToken, profile, done) => {
				const newUser = {
					googleID : profile.id,
					username : profile.id,
					name     : profile.displayName,
					email    : profile.emails[0].value
				};

				var image = profile.photos[0].value;
				image = image.replace('/s50/', '/');
				image = image.replace('/s50-mo/', '/');

				if (image !== '') {
					newUser.image = image;
				}

				// Check for existing user
				User.findOne({
					googleID : profile.id
				}).then((user) => {
					if (user) {
						// Return user
						done(null, user);
					} else {
						// Create user
						new User(newUser).save().then((user) => done(null, user));
					}
				});
			}
		)
	);

	passport.use(
		new FacebookStrategy(
			{
				clientID      : keys.facebookClientID,
				clientSecret  : keys.facebookClientSecret,
				callbackURL   : keys.facebookCallbackURL,
				profileFields : [ 'id', 'displayName', 'photos', 'email' ]
			},
			function(accessToken, refreshToken, profile, done) {
				//console.log(profile);

				const newUser = {
					facebookID : profile.id,
					username   : profile.id,
					name       : profile.displayName,
					email      : profile.emails[0].value,
					//image      : profile.photos[0].value
					image      :
						'https://graph.facebook.com/' +
						profile.id +
						'/picture?width=200&height=200&access_token=' +
						accessToken
				};

				// Check for existing user
				User.findOne({
					facebookID : profile.id
				}).then((user) => {
					if (user) {
						// Return user
						done(null, user);
					} else {
						// Create user
						new User(newUser).save().then((user) => done(null, user));
					}
				});
			}
		)
	);

	//Serialize User
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	//Deserialize User
	passport.deserializeUser((id, done) => {
		User.findById(id).then((user) => done(null, user));
	});
};
