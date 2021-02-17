$(document).ready(function() {
	$('.sidenav').sidenav();
	$('#sidenav').sidenav({ edge: 'left' });

	$('.dropdown-trigger').dropdown({ coverTrigger: false, constrainWidth: false });

	$('#alert_close').click(function() {
		$('#alert_box').fadeOut('slow', function() {});
	});

	$('.modal').modal();
	//$('#newPracticeButton').click($('#modal1').modal('open'));
});

var password1 = document.getElementById('password1');
var password2 = document.getElementById('password2');

var checkPasswordValidity = function() {
	if (password1.value != password2.value) {
		password1.setCustomValidity('Passwords must match.');
		document.getElementById('password1-error').setAttribute('data-error', 'Password Must Match');
	} else {
		password1.setCustomValidity('');
		document.getElementById('password1-error').setAttribute('data-error', '');
		password1.classList.remove('invalid');
		password1.classList.add('valid');
	}
};

password1.addEventListener('change', checkPasswordValidity, false);
password2.addEventListener('change', checkPasswordValidity, false);
