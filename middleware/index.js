const express = require('express');
var User = require('../models/User');

module.exports = {
	isLoggedIn    : function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		//else he is not logged in
		res.redirect('/login');
	},
	isNotLoggedIn : function(req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		//else he is logged in
		res.redirect('/user/' + req.user._id);
	}
};
