export const registrationSchema = {
	email    : {
		notEmpty : true,
		isEmail  : {
			errorMessage : 'Invalid Email'
		}
	},
	password : {
		notEmpty     : true,
		isLength     : {
			options      : [ { min: 12 } ],
			errorMessage : 'Must be at least 12 characters'
		},
		matches      : {
			options      : [ '(?=.*[a-zA-Z])(?=.*[0-9]+).*', 'g' ],
			errorMessage : 'Password must be alphanumeric.'
		},
		errorMessage : 'Invalid password'
	},
	name     : {
		notEmpty : false,
		isLength : {
			options      : [ { max: 200 } ],
			errorMessage : 'The first name must be under 200 characters'
		},
		matches  : {
			options      : [ "^[a-z ,.'-]+$", 'i' ],
			errorMessage : "The first name can only contain letters and the characters (,.'-)"
		}
	}
};
