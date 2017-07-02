Template.teacherEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('subjects');
	});
});

Template.teacherEdit.helpers({
    // user: ()=> {
	// 	var id = FlowRouter.getParam('id');
	// 	return Meteor.users.findOne({_id: id});
	// }
});

AutoForm.addHooks(['updateAdminId'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('home');
	    Bert.alert("successfully updated your account details", 'success');
	}
});
