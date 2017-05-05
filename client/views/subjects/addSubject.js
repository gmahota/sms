Template.addSubject.onCreated(function() {
	var self = this;
	self.autorun(function(){
		self.subscribe('teachers');
	});
});

AutoForm.addHooks(['insertSubjectForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('subjects');
	    Bert.alert("successfully added the subject", 'success');
	}
});
