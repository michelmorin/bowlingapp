const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../middleware');
const User = require('../models/User');

//Redirect if root of auth folder
router.get('/', isLoggedIn, function(req, res) {
	res.redirect('/user/' + req.user._id);
});

//Call Google for authentication
router.get('/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] }));

//Process callback from Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
	// Successful authentication, redirect to dashboard.
	User.findOneAndUpdate({ _id: req.user._id }, { $set: { lastSignedIn: Date.now() } }, { new: true }, function(
		err,
		result
	) {
		if (err) {
			console.log(err);
		}
	});
	res.redirect('/user/' + req.user._id);
});

//Call Facebook for authentication
router.get('/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }));

//Process callback from Facebook
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
	// Successful authentication, redirect to dashboard.
	User.findOneAndUpdate({ _id: req.user._id }, { $set: { lastSignedIn: Date.now() } }, { new: true }, function(
		err,
		result
	) {
		if (err) {
			console.log(err);
		}
	});
	res.redirect('/user/' + req.user._id);
});

//Process logout of user
router.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	res.redirect('/');
});

//Handle other routes not defined
router.get('/:foo', isLoggedIn, function(req, res) {
	res.redirect('/user/' + req.user._id);
});

module.exports = router;
