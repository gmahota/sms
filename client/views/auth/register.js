Template.register.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe('allUsers');
    });
});
Template.register.events({
    'submit .teacher-register': function(event, template) {
        event.preventDefault();
        var firstnameVar = $('[name=firstname]').val();
        var lastnameVar = $('[name=lastname]').val();
        var usernameVar = $('[name=username]').val();
        var phoneVar = $('[name=phoneNumber]').val();
        var emailVar = $('[name=email]').val();
        var passwordVar = $('[name=password]').val();

        $('.register-button').addClass('hidden');

        Accounts.createUser({
            username: usernameVar,
            profile: {
                firstname: firstnameVar,
                lastname: lastnameVar,
                personalPhone: phoneVar
            },
            email: emailVar,
            password: passwordVar,
        }, function(error){
            if(error){
                FlowRouter.go('register');
                Bert.alert( error.reason, 'danger');
                $('.register-button').removeClass('hidden');
                console.log(error);
            } else {
                Roles.addUsersToRoles( Meteor.userId(), ['teacher'], Roles.GLOBAL_GROUP);
                FlowRouter.go('home');
                Bert.alert( 'Welcome. You are signed up as a new teacher', 'success');
                console.log('success');
                // Meteor.call( 'sendVerificationLink', ( error, response ) => {
                //     if ( error ) {
                //         Bert.alert( error.reason, 'danger' );
                //     }
                // });
            }
        });
    }
});
