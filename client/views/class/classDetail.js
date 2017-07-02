Template.classDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClass', id);
		self.subscribe('exams');
		self.subscribe('subjects');
	});
	Session.set('examId', null);
});

Template.classDetail.helpers({
    class: ()=> {
		var id = FlowRouter.getParam('id');
		return Classes.findOne({_id: id});
	},
	exams: function(){
		return Exams.find();
	},
	subjects: function(){
		var id = Meteor.userId();
		var subjectIdArr = Meteor.users.findOne({_id: id}).profile.subjects;
		return Subjects.find({_id: { $in: subjectIdArr }});
	}
});

Template.classDetail.events({
	'change .exam-list': function(){
		var myList = document.getElementById("examList");
		var examId = myList.options[myList.selectedIndex].value;
		Session.set('examId', examId);
	},
	'click .print-class-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var classId = FlowRouter.getParam('id');
		var subjectList = document.getElementById("examList");
		var examId = Session.get('examId');
		if (examId){
			Meteor.call('classResultsPdf', classId, examId, function(err, res) {
		    	if (err) {
					$('.processing').removeClass('show');
					Bert.alert(err.reason, 'danger');
		      	} else if (res) {
					$('.processing').removeClass('show');
					Bert.alert('the file is ready', 'success');
					window.open("data:application/pdf;base64, " + res, '_blank');
		      	}
		    })
		} else {
			$('.processing').removeClass('show');
			Bert.alert('select an exam', 'danger');
		}

	},
	'click .generate-class-list': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var classId = FlowRouter.getParam('id');
		var teacherId = Meteor.userId();
		var subjectList = document.getElementById("subjectList");
		var subjectId = subjectList.options[subjectList.selectedIndex].value;
		if (subjectId){
			Meteor.call('classListPdf', classId, teacherId, subjectId, function(err, res) {
		    	if (err) {
					$('.processing').removeClass('show');
					Bert.alert(err.reason, 'danger');
		      	} else if (res) {
					$('.processing').removeClass('show');
					Bert.alert('the file is ready', 'success');
					window.open("data:application/pdf;base64, " + res, '_blank');
		      	}
		    })
		} else {
			$('.processing').removeClass('show');
			Bert.alert('select the subject', 'danger');
		}

	},
    'click .deactivate-class': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateClass', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('class deactivated', 'danger');
				FlowRouter.go('classes');
			}
		});
	}
});
