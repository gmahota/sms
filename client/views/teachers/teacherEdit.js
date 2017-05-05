Template.teacherEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleTeacher', id);
		self.subscribe('subjects');
	});
});

Template.teacherEdit.helpers({
    teacher: ()=> {
		var id = FlowRouter.getParam('id');
		return Teachers.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateTeacherForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('teachers');
	    Bert.alert("successfully updated", 'success');
	}
});
