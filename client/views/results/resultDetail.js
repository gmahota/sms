Template.resultDetail.onCreated(function() {
	var self = this;
	self.autorun(function(){
        var id = FlowRouter.getParam('id');
		self.subscribe('singleResult', id);
        self.subscribe('studentImages');
        self.subscribe('students');
        self.subscribe('subjects');
        self.subscribe('exams');
        self.subscribe('classes');
	});
});

Template.resultDetail.helpers({
	result: ()=> {
        var id = FlowRouter.getParam('id');
		return Results.findOne({_id: id});
	},
    studentImage: function() {
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).image;
    },
    studentFirstName: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).firstName;
    },
    studentLastName: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).surname;
    },
    studentRegistrationNumber: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).registrationNumber;
    },
    studentYear: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).yearOfAdmission;
    },
    studentClassStreamName: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).streamName;
    },
    studentClassForm: function(){
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).Form;
    },
    examType: function(){
        var resultId = FlowRouter.getParam('id');
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).type;
    },
    examTerm: function(){
        var resultId = FlowRouter.getParam('id');
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).term;
    },
    examYear: function(){
        var resultId = FlowRouter.getParam('id');
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).year;
    },
    subjectCount: function(){
        var resultId = FlowRouter.getParam('id');
        return Results.findOne({_id: resultId}).subjects.length;
    },
    subjectName: function(){
        var id = this.subject
        return Subjects.findOne({_id: id}).name;
    }
});

Template.resultDetail.events({
    'click .delete-result': function(){
        var id = FlowRouter.getParam('id');
        Meteor.call('deleteResult', id);
    },
	'click .print-result': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var id = FlowRouter.getParam('id');
	 	Meteor.call('resultPdf', id, function(err, res) {
	    	if (err) {
				$('.processing').removeClass('show');
				Bert.alert(err.reason, 'danger');
	      	} else if (res) {
				$('.processing').removeClass('show');
				Bert.alert('the file is ready', 'success');
				window.open("data:application/pdf;base64, " + res, '_blank');
	      	}
	    })
	}
});
