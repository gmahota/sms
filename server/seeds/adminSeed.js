Meteor.startup(function() {
  Meteor.setTimeout(function() {
    // if users database is empty, seed these values
    if(Meteor.users.find().count() < 1) {
      // users array
      var users = [
        { username: 'admin', firstname: 'admin', email: 'admin@school.com', password: 'admin123', roles: ['admin'] }
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
            active: true,
        });
        // verify user email
        Meteor.users.update({ _id: userId }, { $set: { 'emails.0.verified': true } });
        // add roles to user
        Roles.addUsersToRoles( userId, ['admin'], Roles.GLOBAL_GROUP);
      });
  } else {
      console.log("the admin exists");
  }
}, 100);
});
