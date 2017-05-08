Results = new Mongo.Collection('results');

if ( Meteor.isServer ) {
  Results._ensureIndex( { name: 1, _id: 1 } );
}

Results.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

SubjectSchema = new SimpleSchema({
    subject: {
        type: String,
        label: "the subject",
        autoform: {
        	type: 'select2',
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
    grade: {
        type: String,
        label: "grade",
    },
    points: {
        type: Number,
        max: 12
    },
    score: {
        type: Number,
        label: "score",
        min: 0,
        max: 100
    },
    comments: {
        type: String,
        optional: true,
        label: "remarks (optional)"
    }
});

ResultSchema = new SimpleSchema({
    student: {
        type: String,
        label: "select the student",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: false
	      	},
            options: function () {
                var options = [];
                Students.find({}).forEach(function (element) {
                    var name = element.firstName + " " + element.surname + " | " + element.registrationNumber
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    exam: {
        type: String,
        label: "the exam",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Exams.find({}).forEach(function (element) {
                    var name = element.type + " | " + element.term + " | " + element.year
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    subjects: {
        type: [SubjectSchema],
        label: "Subjects"
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
    overallScore: {
        type: Number,
        min:0
    },
    overallGrade: {
        type: String,
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
	deleteResult: function(id){
		Results.remove(id);
		FlowRouter.go('results');
	}
});

Results.attachSchema ( ResultSchema );
