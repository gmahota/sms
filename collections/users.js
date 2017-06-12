Users = Meteor.users;
UserImage = new FS.Collection('userImage', {
   stores: [new FS.Store.GridFS('userImage', {path: '~/uploads'})]
});
Users.allow({
	insert: function(userId, doc) {
        return true;
	},
	update: function(userId, doc) {
		return userId;
	}
});
UserImage.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	},
	download: function(userId, doc) {
		return true;
	},
	remove: function(userId, doc) {
		return true;
	}
});

ProfileSchema = new SimpleSchema({
    firstname: {
        type: String,
        label: "first name"
    },
    lastname: {
        type: String,
        optional: true,
        label: "last name"
    },
    personalPhone: {
        type: String,
        optional: true
    },
    staffId: {
        type: String,
        optional: true
    },
    schoolId: {
        type: String,
        optional: true,
        autoform: {
			type: "hidden"
		}
    },
    gender: {
        type: String,
        label: "teacher's gender",
        optional: true,
        autoform: {
            type: 'universe-select',
        	afFieldInput: {
	        	multiple: false
	      	},
            options: [
                {value:"male", label: "male"},
                {value:"female", label: "female"}
            ]
        }
    },
    subjects: {
        type: [String],
        optional: true,
        label: "choose the subject(s) you teach",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: true,
	        	min: 1,
	        	valuesLimit: 10
	      	},
            options: function () {
                var options = [];
                Subjects.find({}).forEach(function (element) {
                    options.push({
                        label: element.name, value: element._id
                    })
                });
                return options;
            }
        }
    },
});
UserSchema = new SimpleSchema({
    username: {
        type: String,
        optional: true,
        label: "username"
    },
    profile: {
        type: ProfileSchema
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        label: "email"
    },
    "emails.$.verified": {
        type: Boolean,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    image: {
        type: String,
        optional: true,
        label: "account image",
        autoform: {
            afFieldInput: {
                type: "cfs-file",
                collection: "userImage",
                accept: 'image/*',
                label: "add your profile image here"
            }
        }
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
			type: "hidden"
		}
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
			type: "hidden"
		}
    },
    heartbeat: {
        type: Date,
        optional: true,
        autoform: {
			type: "hidden"
		}
    },
    active: {
        type: Boolean,
        defaultValue: true,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
	createdAt: {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();  // Prevent user from supplying their own value
			}
		},
		autoform: {
			type: "hidden"
		}
	},
});

Meteor.methods({
    toggleVerification: function(id, verificationState){
        check(id, String);
        Meteor.users.update(id, {
            $set: {
                verification: !verificationState
            }
        });
    },
    deactivateUser: function(id, activeState){
        check(id, String);
        Meteor.users.update(id, {
            $set: {
                active: !activeState
            }
        });
    },
    updateUser: function(id){
        Meteor.users.update(id);
    },
    // deleteUser: function(id, imageId){
    //     Meteor.users.remove(id);
    //     UserImage.remove(imageId);
    //     FlowRouter.go('users');
    // },
    sendVerificationLink: function() {
    var userId = Meteor.userId();
        if ( userId ) {
            return Accounts.sendVerificationEmail(userId);
        }
    },
    createAdmin: function(schoolId){
        check(schoolId, String);

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }
        var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        var schoolEmail = Schools.findOne({_id: schoolId}).email;
        var schoolPhone = Schools.findOne({_id: schoolId}).phoneNumber;
        var users = [
            { username: rString, firstname: 'superadmin', email: schoolEmail, password: 'admin123', roles: ['admin'] }
        ];
        console.log(users);
        // user creation
        _.each(users, function(d) {
            // return id for use in roles assignment below
            var userId = Accounts.createUser({
                username: d.username,
                profile: {
                    firstname: d.firstname,
                    personalPhone: schoolPhone,
                    schoolId: schoolId
                },
                email: d.email,
                password: d.password,
                active: true
            });
            // verify user email
            Meteor.users.update({ _id: userId }, { $set: { 'emails.0.verified': true } });
            // add roles to user
            Roles.addUsersToRoles( userId, ['admin'], Roles.GLOBAL_GROUP);
            console.log("done");
        });
    }
});


Meteor.users.attachSchema(UserSchema);
