Template.classDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClass', id);
		self.subscribe('exams');
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
    'click .delete-class': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteClass', id);
	}
});
