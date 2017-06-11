Template.teacherEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleUser', id);
		self.subscribe('subjects');
	});
});

Template.teacherEdit.helpers({
    user: ()=> {
		var id = FlowRouter.getParam('id');
		return Meteor.users.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateUserId'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('teachers');
	    Bert.alert("successfully updated your account details", 'success');
	}
});
