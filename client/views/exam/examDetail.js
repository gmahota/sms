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
    'click .delete-exam': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteExam', id);
	}
});
