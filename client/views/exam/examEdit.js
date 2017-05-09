Template.examEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleExam', id);
		self.subscribe('classes');
	});
});

Template.examEdit.helpers({
    exam: ()=> {
		var id = FlowRouter.getParam('id');
		return Exams.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateExamId'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('exams');
	    Bert.alert("successfully updated", 'success');
	}
});
