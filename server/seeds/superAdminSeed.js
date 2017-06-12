Meteor.startup(function() {
  Meteor.setTimeout(function() {
    // if users database is empty, seed these values
    if(Meteor.users.find().count() < 1) {
      // users array
      var users = [
        { username: 'superadmin', firstname: 'superadmin', email: 'admin@minerva.com', password: 'superadmin123', roles: ['superAdmin'] }
      ];
      // user creation
      _.each(users, function(d) {
        // return id for use in roles assignment below
        var userId = Accounts.createUser({
            username: d.username,
            profile: {
                firstname: d.firstname
            },
            email: d.email,
            password: d.password,
            active: true
        });
        // verify user email
        Meteor.users.update({ _id: userId }, { $set: { 'emails.0.verified': true } });
        // add roles to user
        Roles.addUsersToRoles( userId, ['superAdmin'], Roles.GLOBAL_GROUP);
      });
  } else {
      console.log("long live the super admin!!");
  }
}, 100);
});
