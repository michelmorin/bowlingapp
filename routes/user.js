const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const { isLoggedIn, isNotLoggedIn } = require('../middleware');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var cloudinary = require('cloudinary').v2;
var multer = require('multer');
var upload = multer({ dest: './public/img/uploads', preservePath: true });
//const fs = require('fs');
const del = require('del');

const User = require('../models/User');

//Redirect to User Dashboard
router.get('/', isLoggedIn, (req, res) => {
	res.redirect('/user/' + req.user._id);
});

//Show User Dashboard
router.get('/:id', isLoggedIn, (req, res) => {
	res.render('dashboard');
});

//Show User Edit Profile
router.get('/:id/edit', isLoggedIn, (req, res) => {
	res.render('editprofile');
});

//Process Edit of Profile
router.put(
	'/:id',
	isLoggedIn,
	[
		check('name')
			.trim()
			.escape()
			.not()
			.isEmpty()
			.withMessage('Name must not be empty')
			.isLength({ max: 50 })
			.withMessage('Name must not exeed 50 characters'),
		check('email', 'Email is not a proper email').trim().normalizeEmail().optional().isEmail()
	],
	(req, res) => {
		// Finds the validation errors in this request and wraps them in Flash Session for error display
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			errorsArray = errors.array();

			//Optional email doesn't work for some reason, removing error if the email is empty
			errorsArray.forEach(function(error, index, array) {
				if (error.value == '' && error.param === 'email') {
					array.splice(index, 1);
				}
			});

			var nameMsg = '';
			var emailMsg = '';

			//Checking each error in Array
			errorsArray.forEach(function(error) {
				if (error.param === 'name') {
					nameMsg = error.msg;
				}
				if (error.param === 'email') {
					emailMsg = error.msg;
				}
			});

			req.session.sessionFlash = {
				nameErrorMsg  : nameMsg,
				emailErrorMsg : emailMsg
			};

			//Need to recheck as optional error may not be valid
			if (errorsArray.length > 0) {
				return res.redirect('/user/' + req.user._id + '/edit');
			}
		}

		const UpdatedUser = {
			name  : req.body.name,
			email : req.body.email
		};

		if (req.body.email == undefined || req.body.email == '@') {
			UpdatedUser.email = '';
		}

		User.findOneAndUpdate({ _id: req.user._id }, { $set: UpdatedUser }, { new: true }, function(err, result) {
			if (err) {
				console.log(err);
			}
		});
		res.redirect('/user/' + req.user._id);
	}
);

//Show Change Password form
router.get('/:id/password', isLoggedIn, (req, res) => {
	res.render('changepassword');
});

//Process Change Password form
router.post(
	'/:id/password',
	isLoggedIn,
	[
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

		if (!errors.isEmpty()) {
			var passwordMsg = '';

			//Checking each error in Array
			errorsArray.forEach(function(error) {
				if (error.param === 'password') {
					passwordMsg = error.msg;
				}
			});

			req.session.sessionFlash = {
				passwordErrorMsg : passwordMsg
			};

			return res.redirect('/user/' + req.user._id + '/password');
		}

		User.findOne({
			_id : req.user._id
		}).then((user) => {
			if (user) {
				user.setPassword(req.body.password, (err, user) => {
					if (err) return next(err);
					user.save();
					req.session.sessionFlash = {
						type             : 'green lighten-2',
						passwordAlertMsg : 'Password was successfully changed'
					};
					res.redirect('/user/' + req.user._id + '/password'); //provide success alert that it was successful change
				});
			} else {
				req.session.sessionFlash = {
					type             : 'red lighten-2',
					passwordAlertMsg : 'Error changing password'
				};
				res.redirect('/user/' + req.user._id + '/password');
			}
		});
	}
);

//Show Change image page
router.get('/:id/image', isLoggedIn, (req, res) => {
	res.render('changeimage');
});

//Process Change image
router.post(
	'/:id/image',
	isLoggedIn,
	[ check('image').trim().not().isEmpty().withMessage('Name must not be empty') ],
	function(req, res) {
		const errors = validationResult(req);
		errorsArray = errors.array();

		if (!errors.isEmpty()) {
			var imageMsg = '';

			//Checking each error in Array
			errorsArray.forEach(function(error) {
				if (error.param === 'image') {
					imageMsg = error.msg;
				}
			});

			req.session.sessionFlash = {
				imageErrorMsg : imageMsg
			};

			res.redirect('/user/' + req.user._id + '/image');
		}

		const UpdatedUser = {
			image : req.body.image
		};

		User.findOneAndUpdate({ _id: req.user._id }, { $set: UpdatedUser }, { new: true }, function(err, user) {
			if (err) {
				console.log(err);
			}
		});

		res.redirect('/user/' + req.user._id + '/edit');
	}
);

//Process Change image
router.post('/:id/upload', isLoggedIn, upload.single('file'), async function(req, res) {
	try {
		if (req.file.size > 1000000) {
			return res.status(500).send('File is too big');
		}

		//Cloudinary config
		cloudinary.config({
			cloud_name : 'bowlingapp',
			api_key    : '542139977549923',
			api_secret : '2pDFwfFKweSc8oqq0kIcRwFnQ88'
		});
		var url = '';

		cloudinary.uploader.upload('./' + req.file.path, function(error, result) {
			if (error) {
				console.log(error);
				return res.status(500).send('upload to cloudinary failed');
			} else {
				url = result.secure_url;

				const UpdatedUser = {
					image : url
				};

				User.findOneAndUpdate({ _id: req.user._id }, { $set: UpdatedUser }, { new: true }, function(err, user) {
					if (err) {
						console.log(err);
					}
				});
			}
		});
		//await fs.unlinkSync('./' + req.file.path);
		await del([ './' + req.file.path ]);

		req.session.sessionFlash = {
			type          : 'green lighten-2',
			imageAlertMsg : 'Image was successfully updated'
		};
		res.redirect('/user/' + req.user._id + '/image'); //provide success alert that it was successful change
	} catch (error) {
		res.redirect('/user/' + req.user._id + '/image'); //Some error happened and just return to page
	}
});

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

//Show Delete User form for confirmation of deletion
router.get('/:id/delete', isLoggedIn, (req, res) => {
	res.render('confirmuserdelete');
});

//Process Deletion User.
router.delete('/:id', isLoggedIn, (req, res) => {
	User.deleteOne({ _id: req.user._id }).then(() => {
		req.logout();
		res.redirect('/');
	});
});

//Show Delete User form for confirmation of deletion
router.get('/:id/league', isLoggedIn, (req, res) => {
	res.render('league');
});

//Show Delete User form for confirmation of deletion
router.get('/:id/tournament', isLoggedIn, (req, res) => {
	res.render('tournament');
});

//Show Delete User form for confirmation of deletion
router.get('/:id/practice', isLoggedIn, (req, res) => {
	res.render('practice');
});

module.exports = router;
