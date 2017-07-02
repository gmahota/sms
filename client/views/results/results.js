Template.results.onCreated(function() {
	var self = this;
	self.autorun(function(){
        self.subscribe('studentImages');
        self.subscribe('students');
        self.subscribe('subjects');
        self.subscribe('exams');
        self.subscribe('classes');
        self.subscribe('results');
	});

	Session.set("examId", null);
	Session.set("classId", null);
	self.examSelection = new ReactiveVar(false);
	self.classSelection = new ReactiveVar(false);
});

Template.results.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	result: ()=> {
		var examSelection = Template.instance().examSelection.get();
		var classSelection = Template.instance().classSelection.get();
		var examId = Session.get('examId');
		var classId = Session.get('classId');
		if (examSelection){
			if(examId){
				if(classSelection){
					if(classId){
						var studentList = Students.find({class: classId}).map(function (student){
							return student._id;
						});
						return Results.find({exam: examId, student: {$in: studentList }});
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
    studentImage: function() {
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).image;
    },
    studentFirstName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).firstName;
    },
    studentLastName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).surname;
    },
    studentRegistrationNumber: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).registrationNumber;
    },
    studentClassStreamName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).streamName;
    },
    studentClassForm: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).Form;
    },
    examType: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).type;
    },
    examTerm: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).term;
    },
    examYear: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).year;
    },
    subjectCount: function(){
        var resultId = this._id
        return Results.findOne({_id: resultId}).subjects.length;
    },
	class: function() {
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

Template.results.events({
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
	}
});
