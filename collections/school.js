Schools = new Mongo.Collection('schools');
SchoolImages = new FS.Collection('schoolImages', {
   stores: [new FS.Store.GridFS('schoolImages', {path: '~/uploads'})]
});

if ( Meteor.isServer ) {
    Schools._ensureIndex( { name: 1, _id: 1 } );
}

Schools.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

SchoolImages.allow({
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

StreamSchema = new SimpleSchema({
    name: {
        type: String,
        label: "the name of a stream"
    }
});
SubjectConstraintSchema = new SimpleSchema({
    maximumSubjects: {
        type: Number,
        autoValue: function() {
			if (this.isInsert) {
				return 11;
			}
        },
        optional: true,
        label: "Maximum number of subjects a student can take"
    },
    minimumSubjects: {
        type: Number,
        autoValue: function() {
			if (this.isInsert) {
				return 7;
			}
        },
        optional: true,
        label: "Minimum number of subjects a student can take"
    },
    transitionForm: {
        type: Number,
        autoValue: function() {
			if (this.isInsert) {
				return 2;
			}
        },
        optional: true,
        label: "The form where a student can begin taking the minimum subject count"
    },
    transitionSession: {
        type: Number,
        autoValue: function() {
			if (this.isInsert) {
				return 3;
			}
        },
        optional: true,
        label: "The session at which a student begint taking the minimum subjects"
    }
});
ExamTypeSchema = new SimpleSchema({
    name: {
        type: String,
        label: "The type of exam eg: Mid-term exams"
    }
});
SessionsSchema = new SimpleSchema({
    numberSessions: {
        type: Number,
        autoValue: function() {
			if (this.isInsert) {
				return 3;
			}
        },
        optional: true,
        label: "Number of sessions (terms) in the year"
    }
});
SchoolSchema = new SimpleSchema({
    name: {
		type: String,
        label: "Name of the school"
	},
    logo: {
        type: String,
        optional: true,
        label: "logo of the school (optional)",
        autoform: {
            afFieldInput: {
                type: "cfs-file",
                collection: "schoolImages",
                accept: 'image/*',
                label: "add the logo image here"
            }
        }
    },
    schoolNumber: {
		type: String,
        label: "The registration number of the school"
	},
    phoneNumber: {
		type: String,
        label: "The phone number of the school"
	},
    address: {
		type: String,
        optional: true,
        label: "The postal address the school"
	},
    email: {
		type: String,
        label: "The email of the school"
	},
    numberOfFormsAvailable: {
        type: Number,
        optional: true,
        autoValue: function() {
			if (this.isInsert) {
				return (4);
			}
        },
        label: "number of forms(grades) available in the school"
    },
    streams: {
        type: [StreamSchema],
        optional: true,
        label: "Streams in the school"
    },
    subjectConstraints: {
		type: SubjectConstraintSchema,
        optional: true
	},
    examType: {
        type: [ExamTypeSchema],
        optional: true
    },
    sessions: {
        type: SessionsSchema,
        optional: true
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
    addDefaults: function(id){
        check(id, String);
        Schools.update(id, {
            $set: {
                examType: [
                    {name: "term opening exams"},
                    {name: "mid-term exams"},
                    {name: "end of term exams"}
                ]
            }
        });
    },
    deactivateSchool: function(id, activeState){
        check(id, String);
        Schools.update(id, {
            $set: {
                active: !activeState
            }
        });
    }
});

Schools.attachSchema ( SchoolSchema );
