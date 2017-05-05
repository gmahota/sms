Template.addTeacher.onCreated(function() {
	var self = this;
	self.autorun(function(){
		self.subscribe('subjects');
	});
});

AutoForm.addHooks(['insertTeacherForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('teachers');
	    Bert.alert("successfully added the teacher", 'success');
	}
});
