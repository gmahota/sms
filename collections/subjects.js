Subjects = new Mongo.Collection('subjects');

if ( Meteor.isServer ) {
  Subjects._ensureIndex( { name: 1, _id: 1 } );
}

Subjects.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return !!userId;
	}
});

ScoreSchema = new SimpleSchema({
    scoreAStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 80;
            }
        }
    },
    scoreA: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 100;
            }
        }
    },
    scoreAMinusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 75;
            }
        }
    },
    scoreAMinus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 79;
            }
        }
    },
    scoreBPlusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 70;
            }
        }
    },
    scoreBPlus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 74;
            }
        }
    },
    scoreBStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 65;
            }
        }
    },
    scoreB: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 69;
            }
        }
    },
    scoreBMinusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 60;
            }
        }
    },
    scoreBMinus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 64;
            }
        }
    },
    scoreCPlusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 55;
            }
        }
    },
    scoreCPlus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 59;
            }
        }
    },
    scoreCStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 50;
            }
        }
    },
    scoreC: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 54;
            }
        }
    },
    scoreCMinusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 45;
            }
        }
    },
    scoreCMinus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 49;
            }
        }
    },
    scoreDPlusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 40;
            }
        }
    },
    scoreDPlus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 44;
            }
        }
    },
    scoreDStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 35;
            }
        }
    },
    scoreD: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 39;
            }
        }
    },
    scoreDMinusStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 30;
            }
        }
    },
    scoreDMinus: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 34;
            }
        }
    },
    scoreEStart: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 0;
            }
        }
    },
    scoreE: {
        type: Number,
        min: 0,
        max: 100,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return 29;
            }
        }
    },
});

SubjectSchema = new SimpleSchema({
    name: {
		type: String
	},
    subjectCode: {
        type: String,
        optional: true,
        label: "Subject Code"
    },
    gradingScheme: {
        type: ScoreSchema,
        label: "The grading table for the subject"
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
                var options = [{label: "select one", value: ""}];
                Meteor.users.find({'roles.__global_roles__':'teacher', active: true}).forEach(function (element) {
                    var name = element.profile.firstname + " " + element.profile.lastname + " | " + element.profile.staffId
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
	},
    order: {
        type: Number,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                var numberOfSubjects = Subjects.find({}).count();
                return (numberOfSubjects + 1);
            }
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
	deleteSubject: function(id){
		Subjects.remove(id);
		FlowRouter.go('subjects');
	},
    deactivateSubject: function(id){
        check(id, String);
        var status = Subjects.findOne({_id: id}).active;
        if(status == true){
            Subjects.update(id, {
                $set: {
                    active: false
                }
            });
        } else {
            Subjects.update(id, {
                $set: {
                    active: true
                }
            });
        }
    }
});

Subjects.attachSchema ( SubjectSchema );
