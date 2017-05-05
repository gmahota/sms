AutoForm.addHooks(['insertClassForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('classes');
	    Bert.alert("successfully added the class", 'success');
	}
});
