Template.subjectEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSubject', id);
		self.subscribe('teachers');
	});
});

Template.subjectEdit.helpers({
    subject: ()=> {
		var id = FlowRouter.getParam('id');
		return Subjects.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateSubjectForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('subjects');
	    Bert.alert("successfully updated", 'success');
	}
});
