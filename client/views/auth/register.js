Template.register.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe('allUsers');
        self.subscribe('schools');
    });
});

Template.register.helpers({
    schools: ()=>{
        var data = Schools.find();
        return data;
    },
    schoolCount: function(){
        return Schools.find().count();
    }
});

Template.register.events({
    'submit .teacher-register': function(event, template) {
        event.preventDefault();
        var firstnameVar = $('[name=firstname]').val();
        var lastnameVar = $('[name=lastname]').val();
        var usernameVar = $('[name=username]').val();
        var phoneVar = $('[name=phoneNumber]').val();
        var emailVar = $('[name=email]').val();
        var schoolVar = $('[name=school]').val();
        var passwordVar = $('[name=password]').val();

        $('.register-button').addClass('hidden');
        if (schoolVar){
            Accounts.createUser({
                username: usernameVar,
                profile: {
                    firstname: firstnameVar,
                    lastname: lastnameVar,
                    personalPhone: phoneVar,
                    schoolId: schoolVar
                },
                email: emailVar,
                password: passwordVar,
            }, function(error){
                if(error){
                    FlowRouter.go('register');
                    Bert.alert( error.reason, 'danger');
                    $('.register-button').removeClass('hidden');
                } else {
                    Roles.addUsersToRoles( Meteor.userId(), ['teacher'], Roles.GLOBAL_GROUP);
                    FlowRouter.go('home');
                    Bert.alert( 'Welcome. You are signed up as a new teacher', 'success');
                    // Meteor.call( 'sendVerificationLink', ( error, response ) => {
                    //     if ( error ) {
                    //         Bert.alert( error.reason, 'danger' );
                    //     }
                    // });
                }
            });
        } else {
            Bert.alert( "please select a school", 'danger' );
            $('.register-button').removeClass('hidden');
        }
    }
});
