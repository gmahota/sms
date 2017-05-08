Timetables = new Mongo.Collection('timetables');

if ( Meteor.isServer ) {
  Timetables._ensureIndex( { name: 1, _id: 1 } );
}

Timetables.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

TimeSchema = new SimpleSchema({
    subject: {
        type: String,
        label: "the subject",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Subjects.find({}).forEach(function (element) {
                    var name = element.name
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    startTime:{
        type: String,
        autoform: {
            type: 'ksrv:clockpicker',
            iconLeft: true,
            clockpickerOptions: {
                autoclose: true
            }
        }
    },
    endTime:{
        type: String,
        autoform: {
            type: 'ksrv:clockpicker',
            iconLeft: true,
            clockpickerOptions: {
                autoclose: true
            }
        }
    }
});

TimetableSchema = new SimpleSchema({
    class: {
        type: String,
        label: "the class affected",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Classes.find({}).forEach(function (element) {
                    var name = element.Form + " " + element.streamName
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    day: {
        type: Number,
        label: "the day of the week",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"monday", label: "monday"},
                {value:"tuesday", label: "tuesday"},
                {value:"wednesday", label: "wednesday"},
                {value:"thursday", label: "thursday"},
                {value:"friday", label: "friday"},
                {value:"saturday", label: "saturday"}
            ]
        }
    },
    term: {
        type: String,
        label: "the term of the year",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"first-term", label: "first-term"},
                {value:"second-term", label: "second-term"},
                {value:"third-term", label: "third-term"}
            ]
        }
    },
    year: {
        type: Number,
        label: "the year",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"2017", label: "2017"},
                {value:"2018", label: "2018"},
                {value:"2019", label: "2019"},
                {value:"2020", label: "2020"},
                {value:"2021", label: "2021"},
                {value:"2022", label: "2022"},
                {value:"2023", label: "2023"},
                {value:"2024", label: "2024"},
                {value:"2025", label: "2025"},
                {value:"2026", label: "2026"},
                {value:"2027", label: "2027"}
            ]
        }
    },
    sessions: {
        type: [TimeSchema]
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
	deleteTimetable: function(id){
		Timetables.remove(id);
		FlowRouter.go('timetables');
	}
});

Timetables.attachSchema ( TimetableSchema );
