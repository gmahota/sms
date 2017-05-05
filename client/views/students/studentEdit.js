Template.studentEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleStudent', id);
		self.subscribe('classes');
        self.subscribe('clubs');
        self.subscribe('sports');
	});
});

Template.studentEdit.helpers({
    student: ()=> {
		var id = FlowRouter.getParam('id');
		return Students.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateStudentForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('students');
	    Bert.alert("successfully updated", 'success');
	}
});
