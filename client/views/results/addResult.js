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

					var score = 0;
					var points = 0;
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

			if (subjectCount >= 7){
				var totalScore = 0;
				for (var i = 0; i < subjectObjectArray.length; i++) {
				    totalScore += subjectObjectArray[i].score << 0;
				}
				var averageScore = totalScore / subjectCount;
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

				Results.insert({
					student: studentId,
					exam: examId,
					subjects: subjectObjectArray,
					overallScore: totalScore,
					overallGrade: grade
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
