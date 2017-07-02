Exams = new Mongo.Collection('exams');

if ( Meteor.isServer ) {
  Exams._ensureIndex( { type: 1, term: 1, year: 1, _id: 1 } );
}

Exams.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

ExamSchema = new SimpleSchema({
    type: {
        type: String,
        label: "the type of the exam",
        autoform: {
            type: 'select2',
            options: function () {
                var options = [{label: "select one", value: ""}];
                var schoolId = Meteor.user().profile.schoolId;
                Schools.findOne({_id: schoolId, active: true}).examType.forEach(function(item){
                    var itemName = item.name;
                    options.push({
                        label: itemName, value: itemName
                    })
                });
                return options;
            }
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
        label: "the year of the exam",
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
    classes: {
        type: [String],
        label: "the class the exam applies to",
        autoform: {
            type: 'universe-select',
        	afFieldInput: {
	        	multiple: true,
	        	min: 1,
	        	valuesLimit: 10
	      	},
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
	deleteExam: function(id){
		Exams.remove(id);
		FlowRouter.go('exams');
	},
    deactivateExam: function(id, activeState){
        check(id, String);
        var status = Exams.findOne({_id: id}).active;
        if(status == true){
            Exams.update(id, {
                $set: {
                    active: false
                }
            });
        } else {
            Exams.update(id, {
                $set: {
                    active: true
                }
            });
        }
    }
});

Exams.attachSchema ( ExamSchema );
