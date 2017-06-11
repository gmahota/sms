Template.login.events({
    'submit .login-form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
            if(error){
                Bert.alert( error.reason, 'danger');
            } else {
                FlowRouter.go('home');
                var userActive = Meteor.users.findOne({_id: Meteor.userId()}).active;
                if (userActive === false) {
                    Meteor.logout();
                    Bert.alert( 'Your account has been deactvated', 'danger');
                }
            }
        });

    }
});
