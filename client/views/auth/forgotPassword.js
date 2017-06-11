Template.forgotPassword.events({
	'submit .forgot-password': function(event, template){
		event.preventDefault();
		var email = $('[name=email]').val();
		Accounts.forgotPassword({email: email}, function(err) {
			if (err){
				if (err.message === 'User not found [403]') {
					Bert.alert('There is no account registered with this email', 'danger');
				}else{
					Bert.alert('Sorry but something went wrong', 'danger');
				}
			}else{
				$('.popup-error-message').removeClass('is-visible');
				var content	= ('A recovery email has been sent to' + ' ' + email);
				Bert.alert( content , 'success' );
			}
		});
		return false;
	}
});
