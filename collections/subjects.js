Subjects = new Mongo.Collection('subjects');

if ( Meteor.isServer ) {
  Subjects._ensureIndex( { name: 1, _id: 1 } );
}

Subjects.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

SubjectSchema = new SimpleSchema({
    name: {
		type: String
	},
    type: {
        type: String,
        label: "the type/group of the subject",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"mathematics", label: "mathematics"},
                {value:"languages", label: "languages"},
                {value:"sciences", label: "sciences"},
                {value:"humanities", label: "humanities"}
            ]
        }
    },
    requirement: {
        type: String,
        label: "the requirement of the subject",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"mandatory", label: "mandatory"},
                {value:"optional", label: "optional"}
            ]
        }
    },
    subjectMaster: {
        type: String,
        label: "the subject master (optional)",
        optional: true,
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Teachers.find({}).forEach(function (element) {
                    var name = element.firstName + " " + element.surname + " | " + element.staffId
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
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
				this.unset();  // Prevent user from supplying their own val
			}
		},
		autoform: {
			type: "hidden"
		}
	},
	updatedAt: {
		type: Date,
		autoValue: function() {
			if (this.isUpdate) {
				return new Date();
			}
		},
		denyInsert: true,
		optional: true,
		autoform: {
			type: "hidden"
		}
	}
});

Meteor.methods({
	deleteSubject: function(id){
		Subjects.remove(id);
		FlowRouter.go('subjects');
	}
});

Subjects.attachSchema ( SubjectSchema );
