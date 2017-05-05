Template.addStudent.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('classes');
        self.subscribe('clubs');
        self.subscribe('sports');
	});
});

AutoForm.addHooks(['insertStudentForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('students');
	    Bert.alert("successfully added the student", 'success');
	}
});
