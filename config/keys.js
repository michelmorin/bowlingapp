var facebookCallbackURL = undefined;

if (typeof process.env.PORT === 'undefined') {
	//Development
	facebookCallbackURL = '/auth/facebook/callback';
} else {
	//Production
	facebookCallbackURL = 'https://www.bowlingapp.ca/auth/facebook/callback';
}

module.exports = {
	mongoURI             :
		'process.env.MONGODB',
	googleClientID       : 'process.env.GOOGLECLIENTID',
	googleClientSecret   : 'process.env.GOOGLECLIENTSECRET',
	googleCallbackURL    : 'process.env.GOOGLECALLBACKURL',
	facebookClientID     : 'process.env.FACEBOOKCLIENTID',
	facebookClientSecret : 'process.env.FACEBOOKCLIENTSECRET',
	facebookCallbackURL  : facebookCallbackURL,
	cloudinaryCloudName  : 'process.env.CLOUDINARYCLOUDNAME',
	cloudinaryAPIKey     : 'process.env.CLOUDINARYAPIKEY',
	cloudinaryAPISecret  : 'process.env.CLOUDINARYAPISECRET'
};
