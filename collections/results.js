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
                Subjects.find({active: true}).forEach(function (element) {
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
        min: 0,
        max: 12,
        decimal: true
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
    },
    mandatory: {
        type: Boolean,
        optional: true,
        autoform: {
			type: "hidden"
		}
    },
    type: {
        type: String,
        optional: true,
        autoform: {
			type: "hidden"
		}
    },
    selected: {
        type: Boolean,
        optional: true,
        autoform: {
			type: "hidden"
		}
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
                Students.find({active: true}).forEach(function (element) {
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
                Exams.find({active: true}).forEach(function (element) {
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
        optional: true,
        min:0,
        decimal: true
    },
    overallMean: {
        type: Number,
        optional: true,
        min:0,
        decimal: true
    },
    overallPoints: {
        type: Number,
        optional: true,
        min:0,
        decimal: true
    },
    overallGrade: {
        type: String,
        optional: true
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
	},
    updateSubjectGradeChange: function(subjectId){
        var subjectData = Subjects.findOne({_id: subjectId}).gradingScheme;
        console.log("subject id:", subjectId);
        if (subjectData.scoreA && subjectData.scoreAMinus && subjectData.scoreBPlus && subjectData.scoreB && subjectData.scoreBMinus && subjectData.scoreCPlus && subjectData.scoreC && subjectData.scoreCMinus && subjectData.scoreDPlus && subjectData.scoreD && subjectData.scoreDMinus && subjectData.scoreE){
            Results.find().map(function(resu){
                console.log("happening");
                var id = resu._id;
                var subjectObjArray = resu.subjects;
                var newResults = [];
                for (var i = 0; i < subjectObjArray.length; i++){
                    var score = subjectObjArray[i].score;
                    var grade = subjectObjArray[i].grade;
                    var points = ((score / 100) * 12).toFixed(1);
                    var subject = subjectObjArray[i].subject;
                    var comments = subjectObjArray[i].comments;

                    var mandatoryCheck = Subjects.findOne({_id: subject}).requirement;
                    var mandatory = false;
                    if (mandatoryCheck == "mandatory"){
                        mandatory = true;
                    }
                    var type = Subjects.findOne({_id: subject}).type;
                    var selected = true;
                    if (subject == subjectId){
                        if (score >= subjectData.scoreAStart  && score <= subjectData.scoreA){
                            grade = "A";
                            comments = "EXCELLENT";
                        } else if (score >= subjectData.scoreAMinusStart && score <= subjectData.scoreAMinus){
                            grade = "A-";
                            comments = "EXCELLENT";
                        } else if (score >= subjectData.scoreBPlusStart && score <= subjectData.scoreBPlus){
                            grade = "B+";
                            comments = "V-GOOD";
                        } else if (score >= subjectData.scoreBStart && score <= subjectData.scoreB){
                            grade = "B";
                            comments = "GOOD";
                        } else if (score >= subjectData.scoreBMinusStart && score <= subjectData.scoreBMinus){
                            grade = "B-";
                            comments = "GOOD";
                        } else if (score >= subjectData.scoreCPlusStart && score <= subjectData.scoreCPlus){
                            grade = "C+";
                            comments = "FAIR";
                        } else if (score >= subjectData.scoreCStart && score <= subjectData.scoreC){
                            grade = "C";
                            comments = "FAIR";
                        } else if (score >= subjectData.scoreCMinusStart && score <= subjectData.scoreCMinus){
                            grade = "C-";
                            comments = "FAIR";
                        } else if (score >= subjectData.scoreDPlusStart && score <= subjectData.scoreDPlus){
                            grade = "D+";
                            comments = "TRIAL";
                        } else if (score >= subjectData.scoreDStart && score <= subjectData.scoreD){
                            grade = "D";
                            comments = "TRIAL";
                        } else if (score >= subjectData.scoreDMinusStart && score <= subjectData.scoreDMinus){
                            grade = "D-";
                            comments = "POOR";
                        } else if (score >= 0.1 && score <= subjectData.scoreE){
                            grade = "E";
                            comments = "V-POOR";
                        } else if(!score && requirement == "optional"){
                            grade = "X";
                            comments = "";
                        }
                    }
                    newResults.push({
                        subject: subject,
                        grade: grade,
                        points: points,
                        score: score,
                        comments: comments,
                        mandatory: mandatory,
                        type: type,
                        selected: selected
                    });
                }

                var studentId = resu.student;
                var studentClassId = Students.findOne({_id: studentId}).class;
                var studentForm = Classes.findOne({_id: studentClassId}).Form;

                if (studentForm == 3 || studentForm == 4){
                    var totalScore = 0;
					for (var i = 0; i < newResults.length; i++) {
					    totalScore += newResults[i].score << 0;
					}

                    var preResultCheck = newResults;
                    preResultCheck.sort(function(a, b) {
                        return parseFloat(a.score) - parseFloat(b.score);
                    });

                    for (var y = 0; y < preResultCheck.length; y++){
						var currentSubject = preResultCheck[y].subject;
						for (var d = 0; d < newResults.length; d++){
							if (currentSubject = newResults[d].subject && newResults[d].mandatory == false){
								newResults[d].selected = false;
								totalScore = totalScore - newResults[d].score;
								break;
							}
						}
					}

					var averageScore = totalScore / 7;

					var grade;

					if (averageScore <= 100 && averageScore >= 80 ){
						grade = "A";
					} else if (averageScore <= 79.99 && averageScore >= 75){
						grade = "A-";
					} else if (averageScore <= 74.99 && averageScore >= 70){
						grade = "B+";
					} else if (averageScore <= 69.99 && averageScore >= 65 ){
						grade = "B";
					} else if (averageScore <= 64.99 && averageScore >= 60){
						grade = "B-";
					} else if (averageScore <= 59.99 && averageScore >= 55){
						grade = "C+";
					} else if (averageScore <= 54.99 && averageScore >= 50 ){
						grade = "C";
					} else if (averageScore <= 49.99 && averageScore >= 45){
						grade = "C-";
					} else if (averageScore <= 44.99 && averageScore >= 40){
						grade = "D+";
					} else if (averageScore <= 39.99 && averageScore >= 35 ){
						grade = "D";
					} else if (averageScore <= 34.99 && averageScore >= 30){
						grade = "D-";
					} else if (averageScore <= 29.99 && averageScore >= 0){
						grade = "E";
					}

                    Results.update(id, {
                        $set: {
                            subjects: newResults,
                            overallScore: totalScore,
    						overallGrade: grade
                        }
                    });
                } else if (studentForm == 1 || studentForm == 2){
                    Results.update(id, {
                        $set: {
                            subjects: newResults
                        }
                    });
                }
            });
        }
    }
});

Results.attachSchema ( ResultSchema );
