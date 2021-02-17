const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const { isLoggedIn, isNotLoggedIn } = require('../middleware');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const User = require('../models/User');

//Landing Page
router.get('/', isNotLoggedIn, function(req, res) {
	res.render('index');
});

//Register Page
router.get('/register', isNotLoggedIn, function(req, res) {
	res.render('register');
});

//Process Registration
router.post(
	'/register',
	[
		check('name')
			.trim()
			.escape()
			.not()
			.isEmpty()
			.withMessage('Name must not be empty')
			.isLength({ max: 50 })
			.withMessage('Name must not exeed 50 characters'),
		check('email', 'Email is not a proper email').trim().normalizeEmail().optional().isEmail(),
		check('username')
			.trim()
			.escape()
			.not()
			.isEmpty()
			.withMessage('Username must not be empty')
			.isLength({ max: 50 })
			.withMessage('Username must not exeed 50 characters'),
		check('password')
			.trim()
			.isLength({ min: 8, max: 50 })
			.withMessage('Password must be between 8 and 50 characters')
			.custom((value, { req }) => {
				if (value !== req.body.password2.trim()) {
					throw new Error('Passwords must match');
				} else {
					return true;
				}
			})
	],
	function(req, res) {
		// Finds the validation errors in this request and wraps them in Flash Session for error display
		const errors = validationResult(req);
		errorsArray = errors.array();

		//If empty the email input returns the @, therefore we remove it
		if (req.body.email == undefined || req.body.email == '@') {
			req.body.email = '';
		}

		if (!errors.isEmpty()) {
			//Optional email doesn't work for some reason, removing error if the email is empty
			errorsArray.forEach(function(error, index, array) {
				if (error.value == '' && error.param === 'email') {
					array.splice(index, 1);
				}
			});

			var usernameMsg = '';
			var nameMsg = '';
			var emailMsg = '';
			var usernameMsg = '';
			var passwordMsg = '';

			//Checking each error in Array
			errorsArray.forEach(function(error) {
				if (error.param === 'username') {
					usernameMsg = error.msg;
				}
				if (error.param === 'name') {
					nameMsg = error.msg;
				}
				if (error.param === 'email') {
					emailMsg = error.msg;
				}
				if (error.param === 'username') {
					usernameMsg = error.msg;
				}
				if (error.param === 'password') {
					passwordMsg = error.msg;
				}
			});

			req.session.sessionFlash = {
				usernameErrorMsg : usernameMsg,
				nameErrorMsg     : nameMsg,
				emailErrorMsg    : emailMsg,
				passwordErrorMsg : passwordMsg,
				username         : req.body.username,
				name             : req.body.name,
				email            : req.body.email
			};

			//Need to recheck as optional error may not be valid
			if (errorsArray.length > 0) {
				return res.redirect('/register');
			}
		}

		const newUser = {
			username : req.body.username,
			name     : req.body.name,
			password : req.body.password,
			email    : req.body.email
		};

		User.findOne({
			username : req.body.username
		}).then((user) => {
			if (user) {
				req.session.sessionFlash = {
					usernameErrorMsg : 'Username already exist',
					username         : req.body.username,
					name             : req.body.name,
					email            : req.body.email
				};
				return res.redirect('/register');
			} else {
				// Create user
				User.register(newUser, req.body.password, function(err, user) {
					if (err) {
						console.log(err);
						return res.redirect('/register');
					}
					passport.authenticate('local')(req, res, function() {
						res.redirect('/user/' + req.user._id);
					});
				});
			}
		});
	}
);

//Login Page
router.get('/login', isNotLoggedIn, function(req, res) {
	res.render('login');
});

//Process Login page
router.post(
	'/login',
	[
		check('username')
			.trim()
			.escape()
			.not()
			.isEmpty()
			.withMessage('Username must not be empty')
			.isLength({ max: 50 })
			.withMessage('Username must not exeed 50 characters')
			.custom((value) => {
				return User.findOne({ username: value }).then((user) => {
					if (user) {
						return true;
					} else {
						return Promise.reject('You have entered an invalid username');
					}
				});
			}),
		check('password')
			.trim()
			.isLength({ min: 8, max: 50 })
			.withMessage('Password must be between 8 and 50 characters')
	],
	function(req, res, next) {
		// Finds the validation errors in this request and wraps them in Flash Session for error display
		const errors = validationResult(req);
		var usernameMsg = '';
		var passwordMsg = '';

		if (!errors.isEmpty()) {
			errorsArray = errors.array();

			//Checking each error in Array
			errorsArray.forEach(function(error) {
				if (error.param === 'username') {
					usernameMsg = error.msg;
				}
				if (error.param === 'password') {
					passwordMsg = error.msg;
				}
			});

			req.session.sessionFlash = {
				usernameErrorMsg : usernameMsg,
				passwordErrorMsg : passwordMsg,
				username         : req.body.username
			};
			return res.redirect('/login');
		}
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				console.log(err);
				return res.redirect('/');
			}
			if (!user) {
				//Authentication failed
				req.session.sessionFlash = {
					usernameErrorMsg : usernameMsg,
					passwordErrorMsg : 'You have entered an invalid password',
					username         : req.body.username
				};
				return res.redirect('/login');
			}
			req.login(user, function(err) {
				if (err) {
					console.log(err);
					return res.redirect('/');
				}
				// Successful authentication, redirect to user dashboard.
				User.findOneAndUpdate(
					{ _id: user._id },
					{ $set: { lastSignedIn: Date.now() } },
					{ new: true },
					function(err, result) {
						if (err) {
							console.log(err);
						}
					}
				);
				return res.redirect('/user/' + req.user._id);
			});
		})(req, res, next);
	}
);

//router.get('/test', function(req, res) {
//	res.render('test');
//});

//Handle other routes not defined
router.get('/:foo', isLoggedIn, function(req, res) {
	res.redirect('/user/' + req.user._id);
});

module.exports = router;
