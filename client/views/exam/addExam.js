Template.addExam.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('classes');
	});
});

AutoForm.addHooks(['insertExamForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('exams');
	    Bert.alert("successfully added the class", 'success');
	}
});
