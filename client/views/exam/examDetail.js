Template.examDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleExam', id);
	});
});

Template.examDetail.helpers({
    exam: ()=> {
		var id = FlowRouter.getParam('id');
		return Exams.findOne({_id: id});
	}
});

Template.examDetail.events({
    'click .deactivate-exam': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateExam', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('this exam is deactivated', 'danger');
				FlowRouter.go('exams');
			}
		});
	}
});
