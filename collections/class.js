Classes = new Mongo.Collection('classes');

if ( Meteor.isServer ) {
  Classes._ensureIndex( { streamName: 1, Form: 1, _id: 1 } );
}

Classes.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return !!userId;
	}
});

ClassSchema = new SimpleSchema({
    streamName: {
        type: String,
        label: "select the stream (defined under school settings)",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [{label: "select one", value: ""}];
                var schoolId = Meteor.user().profile.schoolId;
                Schools.findOne({_id: schoolId, active: true}).streams.forEach(function(item){
                    var itemName = item.name;
                    options.push({
                        label: itemName, value: itemName
                    })
                });
                return options;
            }
        }
	},
    Form: {
        type: Number,
        label: "the form of the class",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"1", label: "1"},
                {value:"2", label: "2"},
                {value:"3", label: "3"},
                {value:"4", label: "4"}
            ]
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
	deleteClass: function(id){
        var studentCheck = Students.find({class: id}).count();
        var examCheck = Exams.find({classes: {$eq: id}}).count();
        var timetableCheck = Timetables.find({class: id}).count();

        if (studentCheck > 0 || examCheck > 0 || timetableCheck > 0){
            Bert.alert("you cannot delete this class. Disable the class insted", "danger");
        } else {
            Classes.remove(id);
    		FlowRouter.go('classes');
        }
	},
    deactivateClass: function(id){
        check(id, String);
        var status = Classes.findOne({_id: id}).active;
        if(status == true){
            Classes.update(id, {
                $set: {
                    active: false
                }
            });
        } else {
            Classes.update(id, {
                $set: {
                    active: true
                }
            });
        }
    }
});

Classes.attachSchema ( ClassSchema );
