AutoForm.addHooks(['insertSchoolForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('schools');
		Meteor.call('addDefaults', result);
		Meteor.call('createAdmin', result);
	    Bert.alert("successfully added the school", 'success');
	}
});
