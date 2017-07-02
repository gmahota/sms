Students = new Mongo.Collection('students');
StudentImages = new FS.Collection('studentImages', {
   stores: [new FS.Store.GridFS('studentImages', {path: '~/uploads'})]
});

if ( Meteor.isServer ) {
    Students._ensureIndex( { firstName: 1, surname: 1, registrationNumber: 1, yearOfAdmission: 1, _id: 1 } );
}

Students.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

StudentImages.allow({
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

extraCurricularSchema = new SimpleSchema({
    clubs: {
        type: [String],
        label: "choose the clubs the student participates in",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: true,
	        	min: 1,
	        	valuesLimit: 10
	      	},
            options: function () {
                var options = [];
                Clubs.find({active: true}).forEach(function (element) {
                    options.push({
                        label: element.name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    sports: {
        type: [String],
        label: "choose the sports the student participates in",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: true,
	        	min: 1,
	        	valuesLimit: 10
	      	},
            options: function () {
                var options = [];
                Sports.find({active: true}).forEach(function (element) {
                    options.push({
                        label: element.name, value: element._id
                    })
                });
                return options;
            }
        }
    }
});

NextOfKinSchema = new SimpleSchema({
    firstName: {
		type: String
	},
    surname: {
		type: String
	},
    address: {
		type: String
	},
    email: {
		type: String,
        label: "email (optional)",
        regEx: SimpleSchema.RegEx.Email,
        optional: true
	},
    phoneNumber: {
		type: String,
		label: "The phone number"
	},
    relationship: {
        type: String,
        label: "The relationship of the kin",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"parent", label: "parent"},
                {value:"guardian", label: "guardian"}
            ]
        }
    }
});

StudentSchema = new SimpleSchema({
    firstName: {
		type: String
	},
    surname: {
		type: String
	},
    gender: {
        type: String,
        label: "The gender of the student",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"male", label: "male"},
                {value:"female", label: "female"}
            ]
        }
    },
    religion: {
        type: String,
        label: "The religion of the student",
        optional: true,
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"christian", label: "christian"},
                {value:"muslim", label: "muslim"},
                {value:"sikh", label: "sikh"},
                {value:"aethist", label: "aethist"},
                {value:"other", label: "other"}
            ]
        }
    },
    dateOfBirth: {
        type: Date,
        optional: true,
        label: "The date of birth of the student"
    },
    extraCurricular: {
        type: extraCurricularSchema,
        optional: true,
        label: "Extra Curricular"
    },
    kcpeResults: {
		type: Number,
        min: 1,
        max: 500,
        optional: true,
        label: "The student's K.C.P.E Results"
	},
    class: {
        type: String,
        label: "the class of the student",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Classes.find({active: true}).forEach(function (element) {
                    var name = element.Form + " " + element.streamName
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    yearOfAdmission: {
        type: Number,
        label: "the year of the student's admission",
        optional: true,
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"2014", label: "2014"},
                {value:"2015", label: "2015"},
                {value:"2016", label: "2016"},
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
    registrationNumber: {
		type: String
	},
    NextOfKin: {
        type: [NextOfKinSchema],
        label: "Next of kin",
        optional: true
    },
    image: {
        type: String,
        optional: true,
        label: "image of the student (optional)",
        autoform: {
            afFieldInput: {
                type: "cfs-file",
                collection: "studentImages",
                accept: 'image/*',
                label: "add student's image here"
            }
        }
    },
    homeAddress: {
		type: String,
        label: "home address",
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
    alumni: {
        type: Boolean,
        defaultValue: false,
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
	deleteStudent: function(id, imageId){
		Students.remove(id);
		StudentImages.remove(imageId);
		FlowRouter.go('students');
	},
    deactivateStudent: function(id){
        check(id, String);
        var status = Students.findOne({_id: id}).active;
        if(status == true){
            Students.update(id, {
                $set: {
                    active: false
                }
            });
        } else {
            Students.update(id, {
                $set: {
                    active: true
                }
            });
        }
    },
    convertAlumni: function(id, alumniState){
        check(id, String);
        var classId = Students.findOne({_id: id}).class;
        var activeState = Students.findOne({_id: id}).active;
        var classNum = Classes.findOne({_id: classId}).Form;
        if (classNum == 4 && activeState == true){
            Students.update(id, {
                $set: {
                    alumni: !alumniState
                }
            });
        }
    }
});

Students.attachSchema ( StudentSchema );
