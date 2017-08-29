Template.addResult.onCreated(function() {
	var self = this;
	self.autorun(function() {
        self.subscribe('students');
        self.subscribe('subjects');
        self.subscribe('exams');
		self.subscribe('classes');
        self.subscribe('teachers');
		self.subscribe('results');
	});

	Session.set("examId", null);
	Session.set("classId", null);

	self.examSelection = new ReactiveVar(false);
	self.classSelection = new ReactiveVar(false);

});

Template.addResult.helpers({
	subjectsAvailable: ()=> {
		return Subjects.find().fetch();
	},
	teaching: function(){
		var id = Meteor.userId();
		var teachingSubjects = Meteor.users.findOne({_id: id}).profile.subjects;
		return teachingSubjects.includes(this._id);
	},
	isRequired: function(){
		var requiredStatus = Subjects.findOne({_id: this._id}).requirement;
		if (requiredStatus == "mandatory"){
			return true;
		} else {
			return false;
		}
	},
	shortName: function(){
		var name = Subjects.findOne({_id: this._id}).name;
		return (name.substring(0, 3));
	},
	minScore: function(){
		return 0;
	},
	maxScore: function(){
		return 100;
	},
	student: ()=> {
		var examSelection = Template.instance().examSelection.get();
		var classSelection = Template.instance().classSelection.get();
		var examId = Session.get('examId');
		var classId = Session.get('classId');
		if (examSelection){
			if(examId){
				if(classSelection){
					if(classId){
						var resultCheck = Results.find({ exam: examId }).map( function (result){
							return result.student;
						});
						return Students.find({class: classId, _id: {$nin: resultCheck}, active: true});
					} else {
						return Students.find({class: "123"});
					}
				} else {
					return
				}
			} else {
				return
			}
		} else {
			return
		}
	},
	class: ()=> {
		var examSelection = Template.instance().examSelection.get();
		var examId = Session.get('examId');
		if (examSelection){
			if(examId){
				var classIdArray = Exams.findOne({_id: examId}).classes;
				return Classes.find({_id: { $in: classIdArray }, active: true}).fetch().reverse();
			} else {
				return
			}
		} else {
			return
		}
	},
	colCount: function(){
		var subjectCount = Subjects.find().count();
		return (subjectCount + 2);
	},
	exam: ()=> {
		return Exams.find({active: true}).fetch().reverse();
	},
	examSelected: function(){
		return Template.instance().examSelection.get();
	},
	classSelected: function(){
		return Template.instance().classSelection.get();
	}
});

Template.addResult.events({
	'change .exam-list': function(event, template){
		var myList = document.getElementById("examList");
		var examSelected = Template.instance().examSelection.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('examId', selectedValue );
			Session.set('classId', null );
			if (examSelected){
				template.examSelection.set(false);
				template.examSelection.set(true);
			} else {
				template.examSelection.set(true);
			}
			template.classSelection.set(false);
		}
	},
	'change .class-list': function(event, template){
		var myList = document.getElementById("classList");
		var classSelected = Template.instance().examSelection.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('classId', selectedValue );
			if (classSelected){
				template.classSelection.set(false);
				template.classSelection.set(true);
			} else {
				template.classSelection.set(true);
			}
		}
	},
	'click .save': function(e, event, template){
		var examId = Session.get('examId');
		var studentId = $(e.target).attr('id');
		if (studentId != null){
			var trId = "tr#" + studentId;
			var subjectObjectArray = [];
			$(trId).each(function() {
				var row = this;
				$('input', this).each(function() {
					var scoreVal = $(this).val();
					var subjectId = $(this).attr('id');
					var requirement = Subjects.findOne({_id: subjectId}).requirement;
					var subjectName = Subjects.findOne({_id: subjectId}).name;
					var subjectData = Subjects.findOne({_id: subjectId}).gradingScheme;
					var mandatoryStateData = Subjects.findOne({_id: subjectId}).requirement;
					var mandatoryState = false;
					if (mandatoryStateData == "mandatory") {
						mandatoryState = true;
					}
					var subjectType = Subjects.findOne({_id: subjectId}).type;

					var score = 0;
					var points = (((scoreVal * 1)/ 100) * 12).toFixed(1);
					var grade = "X";
					var comments = "";

					if (!scoreVal && requirement == "mandatory") {
						$(this).addClass('field-red');
						Bert.alert("scores of mandatory subjects were not entered", 'danger');
						return;
					} else if (scoreVal == 0 && requirement == "mandatory") {
						$(this).addClass('field-red');
						Bert.alert("scores of mandatory subjects cannot be 0", 'danger');
						return;
					} else if (scoreVal > 100 ) {
						$(this).addClass('field-red');
						var message = "scores for " + subjectName + " cannot be more than 100%";
						Bert.alert(message, 'danger');
						return;
					} else if (scoreVal <= 100 && scoreVal >= 0.1 ){
						$(this).removeClass('field-red');
						if (subjectData){
							if (subjectData.scoreA && subjectData.scoreAMinus && subjectData.scoreBPlus && subjectData.scoreB && subjectData.scoreBMinus && subjectData.scoreCPlus && subjectData.scoreC && subjectData.scoreCMinus && subjectData.scoreDPlus && subjectData.scoreD && subjectData.scoreDMinus && subjectData.scoreE){
							    if (scoreVal >= subjectData.scoreAStart  && scoreVal <= subjectData.scoreA){
							        score = scoreVal;
							        grade = "A";
							        comments = "EXCELLENT";
							    } else if (scoreVal >= subjectData.scoreAMinusStart && scoreVal <= subjectData.scoreAMinus){
							        score = scoreVal;
							        grade = "A-";
							        comments = "EXCELLENT";
							    } else if (scoreVal >= subjectData.scoreBPlusStart && scoreVal <= subjectData.scoreBPlus){
							        score = scoreVal;
							        grade = "B+";
							        comments = "V-GOOD";
							    } else if (scoreVal >= subjectData.scoreBStart && scoreVal <= subjectData.scoreB){
							        score = scoreVal;
							        grade = "B";
							        comments = "GOOD";
							    } else if (scoreVal >= subjectData.scoreBMinusStart && scoreVal <= subjectData.scoreBMinus){
							        score = scoreVal;
							        grade = "B-";
							        comments = "GOOD";
							    } else if (scoreVal >= subjectData.scoreCPlusStart && scoreVal <= subjectData.scoreCPlus){
							        score = scoreVal;
							        grade = "C+";
							        comments = "FAIR";
							    } else if (scoreVal >= subjectData.scoreCStart && scoreVal <= subjectData.scoreC){
							        score = scoreVal;
							        grade = "C";
							        comments = "FAIR";
							    } else if (scoreVal >= subjectData.scoreCMinusStart && scoreVal <= subjectData.scoreCMinus){
							        score = scoreVal;
							        grade = "C-";
							        comments = "FAIR";
							    } else if (scoreVal >= subjectData.scoreDPlusStart && scoreVal <= subjectData.scoreDPlus){
							        score = scoreVal;
							        grade = "D+";
							        comments = "TRIAL";
							    } else if (scoreVal >= subjectData.scoreDStart && scoreVal <= subjectData.scoreD){
							        score = scoreVal;
							        grade = "D";
							        comments = "TRIAL";
							    } else if (scoreVal >= subjectData.scoreDMinusStart && scoreVal <= subjectData.scoreDMinus){
							        score = scoreVal;
							        grade = "D-";
							        comments = "POOR";
							    } else if (scoreVal >= 0.1 && scoreVal <= subjectData.scoreE){
							        score = scoreVal;
							        grade = "E";
							        comments = "V-POOR";
							    } else if(!scoreVal && requirement == "optional"){
							        score = 0;
							        grade = "X";
							        comments = "";
							    }
							} else {
							    if (scoreVal >= 80  && scoreVal <= 100){
							        score = scoreVal;
							        grade = "A";
							        comments = "EXCELLENT";
							    } else if (scoreVal >= 75 && scoreVal <= 79.99){
							        score = scoreVal;
							        grade = "A-";
							        comments = "EXCELLENT";
							    } else if (scoreVal >= 70 && scoreVal <= 74.99){
							        score = scoreVal;
							        grade = "B+";
							        comments = "V-GOOD";
							    } else if (scoreVal >= 65 && scoreVal <= 69.99){
							        score = scoreVal;
							        grade = "B";
							        comments = "GOOD";
							    } else if (scoreVal >= 60 && scoreVal <= 64.99){
							        score = scoreVal;
							        grade = "B-";
							        comments = "GOOD";
							    } else if (scoreVal >= 55 && scoreVal <= 59.99){
							        score = scoreVal;
							        grade = "C+";
							        comments = "FAIR";
							    } else if (scoreVal >= 50 && scoreVal <= 54.99){
							        score = scoreVal;
							        grade = "C";
							        comments = "FAIR";
							    } else if (scoreVal >= 45 && scoreVal <= 49.99){
							        score = scoreVal;
							        grade = "C-";
							        comments = "FAIR";
							    } else if (scoreVal >= 40 && scoreVal <= 44.99){
							        score = scoreVal;
							        grade = "D+";
							        comments = "TRIAL";
							    } else if (scoreVal >= 35 && scoreVal <= 39.99){
							        score = scoreVal;
							        grade = "D";
							        comments = "TRIAL";
							    } else if (scoreVal >= 30 && scoreVal <= 34.99){
							        score = scoreVal;
							        grade = "D-";
							        comments = "POOR";
							    } else if (scoreVal >= 0.1 && scoreVal <= 29.99){
							        score = scoreVal;
							        grade = "E";
							        comments = "V-POOR";
							    } else if(!scoreVal && requirement == "optional"){
							        score = 0;
							        grade = "X";
							        comments = "";
							    }
							}
						} else {
						    if (scoreVal >= 80  && scoreVal <= 100){
						        score = scoreVal;
						        grade = "A";
						        comments = "EXCELLENT";
						    } else if (scoreVal >= 75 && scoreVal <= 79.99){
						        score = scoreVal;
						        grade = "A-";
						        comments = "EXCELLENT";
						    } else if (scoreVal >= 70 && scoreVal <= 74.99){
						        score = scoreVal;
						        grade = "B+";
						        comments = "V-GOOD";
						    } else if (scoreVal >= 65 && scoreVal <= 69.99){
						        score = scoreVal;
						        grade = "B";
						        comments = "GOOD";
						    } else if (scoreVal >= 60 && scoreVal <= 64.99){
						        score = scoreVal;
						        grade = "B-";
						        comments = "GOOD";
						    } else if (scoreVal >= 55 && scoreVal <= 59.99){
						        score = scoreVal;
						        grade = "C+";
						        comments = "FAIR";
						    } else if (scoreVal >= 50 && scoreVal <= 54.99){
						        score = scoreVal;
						        grade = "C";
						        comments = "FAIR";
						    } else if (scoreVal >= 45 && scoreVal <= 49.99){
						        score = scoreVal;
						        grade = "C-";
						        comments = "FAIR";
						    } else if (scoreVal >= 40 && scoreVal <= 44.99){
						        score = scoreVal;
						        grade = "D+";
						        comments = "TRIAL";
						    } else if (scoreVal >= 35 && scoreVal <= 39.99){
						        score = scoreVal;
						        grade = "D";
						        comments = "TRIAL";
						    } else if (scoreVal >= 30 && scoreVal <= 34.99){
						        score = scoreVal;
						        grade = "D-";
						        comments = "POOR";
						    } else if (scoreVal >= 0.1 && scoreVal <= 29.99){
						        score = scoreVal;
						        grade = "E";
						        comments = "V-POOR";
						    } else if(!scoreVal && requirement == "optional"){
						        score = 0;
						        grade = "X";
						        comments = "";
						    }
						}
						subjectObjectArray.push({
							score: parseInt(score),
							points: points,
							grade: grade,
							comments: comments,
							subject: subjectId,
							mandatory: mandatoryState,
							type: subjectType,
							selected: true
						});
					}
				});
			});
			$.each(subjectObjectArray, function(i, el){
			    if (this.grade == "X"){
			        subjectObjectArray.splice(i, 1);
			    }
			});

			var subjectCount = subjectObjectArray.length;

			var studentClassId = Students.findOne({_id: studentId}).class;
			var studentClassForm = Classes.findOne({_id: studentClassId}).Form;
			if (studentClassForm == 1 || studentClassForm == 2 ){
				if (subjectCount >= 7 && subjectCount <= 11){
					var totalScore = 0;
					var totalPoints = 0;
					for (var i = 0; i < subjectObjectArray.length; i++) {
					    totalScore += subjectObjectArray[i].score << 0;
						totalScore += subjectObjectArray[i].points << 0;
					}
					var averageScore = totalScore / subjectCount;
					var averagePoints = totalPoints / subjectCount;
					var grade;

					var integerPoints = averagePoints.toFixed(1);

					if (integerPoints >= 11.5 && integerPoints <= 12){
	                    grade = "A";
	                } else if (integerPoints >= 10.5 && integerPoints <= 11){
	                    grade = "A-";
	                } else if (integerPoints >= 9.5 && integerPoints <= 10){
	                    grade = "B+";
	                } else if (integerPoints >= 8.5 && integerPoints <= 9){
	                    grade = "B";
	                } else if (integerPoints >= 7.5 && integerPoints <= 8){
	                    grade = "B-";
	                } else if (integerPoints >= 6.5 && integerPoints <= 7){
	                    grade = "C+";
	                } else if (integerPoints >= 5.5 && integerPoints <= 6){
	                    grade = "C";
	                } else if (integerPoints >= 4.5 && integerPoints <= 5){
	                    grade = "C-";
	                } else if (integerPoints >= 3.5 && integerPoints <= 4){
	                    grade = "D+";
	                } else if (integerPoints >= 2.5 && integerPoints <= 3){
	                    grade = "D";
	                } else if (integerPoints >= 1.5 && integerPoints <= 2){
	                    grade = "D-";
	                } else if (integerPoints >= 0 && integerPoints <= 1){
	                    grade = "E";
	                }

					Results.insert({
						student: studentId,
						exam: examId,
						subjects: subjectObjectArray,
						overallScore: totalScore,
						overallGrade: grade,
						overallMean: averageScore,
						overallPoints: averagePoints.toFixed(3)
					}, (error) => {
						if (error){
							Bert.alert(error.reason, 'danger');
						} else {
							Bert.alert('added successfully', 'success');
						}
					});
				} else if (subjectCount < 7){
					Bert.alert("A minimum of 7 subject results is required", 'danger');
				} else if (subjectCount > 11){
					Bert.alert("A student can only have a maximum of 11 subject results", 'danger');
				}
			} else if (studentClassForm == 3 || studentClassForm == 4 ){
				if (subjectCount >= 7 && subjectCount <= 8){
					var totalScore = 0;
					var totalPoints = 0;
					for (var i = 0; i < subjectObjectArray.length; i++) {
					    totalScore += subjectObjectArray[i].score;
						totalScore += subjectObjectArray[i].points;
					}

					if (subjectObjectArray.length > 7){
		                var preResultCheck = subjectObjectArray.slice();
		                preResultCheck.sort(function(a, b) {
		                    return parseFloat(a.score) - parseFloat(b.score);
		                });
		                var deductibleObjs = preResultCheck.filter(function( obj ) {
		                  return obj.mandatory != true;
		                });
		                var scienceInDeductibles = deductibleObjs.filter(function( scienceObj ) {
		                  return scienceObj.type == "sciences";
		                });
		                var scienceCount = scienceInDeductibles.length;

		                var updatedDeductible = [];
		                if (scienceCount = 1){
		                    updatedDeductible = deductibleObjs.filter(function( scienceObj ) {
		                      return scienceObj.type != "sciences";
		                    });
		                } else if (scienceCount > 1){
		                    var flippedDeductibleObjs = deductibleObjs.slice();
		                    flippedDeductibleObjs.sort(function(a, b) {
		                        return parseFloat(b.score) - parseFloat(a.score);
		                    });
		                    var sciencePass = flippedDeductibleObjs.find(function(item){
		                        return item.type == "sciences";
		                    });
		                    updatedDeductible = deductibleObjs.filter(function( scienceObj ) {
		                      return scienceObj.subject != sciencePass.subject;
		                    });
		                }

		                var deductibleObj = updatedDeductible[0];
		                var deductibleScore = updatedDeductible[0].score;
						var deductiblePoints = updatedDeductible[0].points;
		                var deductibleSubject = updatedDeductible[0].subject;

		                for (var y = 0; y < subjectObjectArray.length; y++){
		                    var currentSubject = subjectObjectArray[y].subject;
		                    if (currentSubject == deductibleSubject){
		                        subjectObjectArray[y].selected = false;
		                    }
		                }

		                totalScore = totalScore - deductibleScore;
						totalPoints = totalPoints - deductiblePoints;
		            }
					var averageScore = totalScore / 7;
					var averagePoints = totalPoints / 7;

					var grade;

					var integerPoints = averagePoints.toFixed(1);

					if (integerPoints >= 11.5 && integerPoints <= 12){
	                    grade = "A";
	                } else if (integerPoints >= 10.5 && integerPoints <= 11){
	                    grade = "A-";
	                } else if (integerPoints >= 9.5 && integerPoints <= 10){
	                    grade = "B+";
	                } else if (integerPoints >= 8.5 && integerPoints <= 9){
	                    grade = "B";
	                } else if (integerPoints >= 7.5 && integerPoints <= 8){
	                    grade = "B-";
	                } else if (integerPoints >= 6.5 && integerPoints <= 7){
	                    grade = "C+";
	                } else if (integerPoints >= 5.5 && integerPoints <= 6){
	                    grade = "C";
	                } else if (integerPoints >= 4.5 && integerPoints <= 5){
	                    grade = "C-";
	                } else if (integerPoints >= 3.5 && integerPoints <= 4){
	                    grade = "D+";
	                } else if (integerPoints >= 2.5 && integerPoints <= 3){
	                    grade = "D";
	                } else if (integerPoints >= 1.5 && integerPoints <= 2){
	                    grade = "D-";
	                } else if (integerPoints >= 0 && integerPoints <= 1){
	                    grade = "E";
	                }

					Results.insert({
						student: studentId,
						exam: examId,
						subjects: subjectObjectArray,
						overallScore: totalScore,
						overallGrade: grade,
						overallMean: averageScore,
						overallPoints: averagePoints.toFixed(3)
					}, (error) => {
						if (error){
							Bert.alert(error.reason, 'danger');
						} else {
							Bert.alert('added successfully', 'success');
						}
					});
				} else if (subjectCount < 7){
					Bert.alert("A minimum of 7 subject results is required", 'danger');
				} else if (subjectCount > 11){
					Bert.alert("A student can only have a maximum of 8 subject results", 'danger');
				}
			}

		} else {
			Bert.alert("something's not right", 'danger');
		}

	},

	'click .update': function(e, event, template){
		var examId = Session.get('examId');
		var studentId = $(e.target).attr('id');
		if (studentId != null){
			var trId = "tr#" + studentId;
			var subjectObjectArray = [];
			$(trId).each(function() {
				var row = this;
				$('input', this).each(function() {
					var scoreVal = $(this).val();
					var subjectId = $(this).attr('id');
					var requirement = Subjects.findOne({_id: subjectId}).requirement;
					var subjectName = Subjects.findOne({_id: subjectId}).name;

					var score = 0;
					var points = 0;
					var grade = "X";
					var comments = "";

					if (scoreVal > 100 ) {
						$(this).addClass('field-red');
						var message = "scores for " + subjectName + " cannot be more than 100%";
						Bert.alert(message, 'danger');
						return;
					} else if (scoreVal <= 100 && scoreVal >= 0.1 ){
						$(this).removeClass('field-red');
						if (scoreVal >= 80 && scoreVal <= 100){
							score = scoreVal;
							points = 12;
							grade = "A";
							comments = "EXCELLENT";
						} else if (scoreVal >= 75 && scoreVal <= 79.99){
							score = scoreVal;
							points = 11;
							grade = "A-";
							comments = "EXCELLENT";
						} else if (scoreVal >= 70 && scoreVal <= 74.99){
							score = scoreVal;
							points = 10;
							grade = "B+";
							comments = "V-GOOD";
						} else if (scoreVal >= 65 && scoreVal <= 69.99){
							score = scoreVal;
							points = 9;
							grade = "B";
							comments = "GOOD";
						} else if (scoreVal >= 60 && scoreVal <= 64.99){
							score = scoreVal;
							points = 8;
							grade = "B-";
							comments = "GOOD";
						} else if (scoreVal >= 55 && scoreVal <= 59.99){
							score = scoreVal;
							points = 7;
							grade = "C+";
							comments = "FAIR";
						} else if (scoreVal >= 50 && scoreVal <= 54.99){
							score = scoreVal;
							points = 6;
							grade = "C";
							comments = "FAIR";
						} else if (scoreVal >= 45 && scoreVal <= 49.99){
							score = scoreVal;
							points = 5;
							grade = "C-";
							comments = "FAIR";
						} else if (scoreVal >= 40 && scoreVal <= 44.99){
							score = scoreVal;
							points = 4;
							grade = "D+";
							comments = "TRIAL";
						} else if (scoreVal >= 35 && scoreVal <= 39.99){
							score = scoreVal;
							points = 3;
							grade = "D";
							comments = "TRIAL";
						} else if (scoreVal >= 30 && scoreVal <= 34.99){
							score = scoreVal;
							points = 2;
							grade = "D-";
							comments = "POOR";
						} else if (scoreVal >= 0.1 && scoreVal <= 29.99){
							score = scoreVal;
							points = 1;
							grade = "E";
							comments = "V-POOR";
						} else if(!scoreVal && requirement == "optional"){
							score = 0;
							points = 0;
							grade = "X";
							comments = "";
						}
						subjectObjectArray.push({
							score: parseInt(score),
							points: points,
							grade: grade,
							comments: comments,
							subject: subjectId
						});
					}
				});
			});
			$.each(subjectObjectArray, function(i, el){
			    if (this.grade == "X"){
			        subjectObjectArray.splice(i, 1);
			    }
			});

			var subjectCount = subjectObjectArray.length;

			if (subjectCount >= 1){
				Results.insert({
					student: studentId,
					exam: examId,
					subjects: subjectObjectArray
				}, (error) => {
					if (error){
		                Bert.alert(error.reason, 'danger');
		            } else {
		                Bert.alert('added successfully', 'success');
		            }
				});
			}
		} else {
			Bert.alert("something's not right", 'danger');
		}

	}
});
