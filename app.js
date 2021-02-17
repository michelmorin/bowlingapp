const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const seedDB = require('./config/seeds');

//Enforce SSL connection to site
const https = require('https');
const fs = require('fs');
const enforce = require('express-sslify');

const app = express();

//Method Override
app.use(methodOverride('_method'));

//Use SSL Connection, trustProtoHeader is needed for Heroku
app.use(enforce.HTTPS({ trustProtoHeader: true }));

// Load Keys
const keys = require('./config/keys');

// Load Models
const User = require('./models/User');

// Express Validator
app.use(expressValidator());

// Passport Config
require('./config/passport')(passport);

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Set View Engine
app.set('view engine', 'ejs');

// Set static folder
app.use(express.static('public'));

//Removes Mongoose Deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// Mongoose Connect
mongoose.connect(keys.mongoURI).then(() => console.log('MongoDB Connected')).catch((err) => console.log(err));

//seed the database
// seedDB();

//Configure express-session
var sess = {
	secret            : 'Mischief Mananged',
	store             : new MongoStore({ mongooseConnection: mongoose.connection }),
	resave            : false,
	saveUninitialized : false,
	cookie            : {}
};

//Make sessions secure on production site
if (typeof process.env.PORT !== 'undefined') {
	app.set('trust proxy', 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set global vars
app.use((req, res, next) => {
	res.locals.user = req.user || null;
	res.locals.sessionFlash = req.session.sessionFlash;
	delete req.session.sessionFlash;
	next();
});

app.use(flash());

// Load Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Use Routes
app.use('/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/user', userRoutes);

const port = process.env.PORT || 5000;

const httpsOptions = {
	key  : fs.readFileSync('./key.pem'),
	cert : fs.readFileSync('./cert.pem')
};

if (typeof process.env.PORT === 'undefined') {
	const server = https.createServer(httpsOptions, app).listen(port, () => {
		console.log('server running locally on port ' + port);
	});
} else {
	app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}
