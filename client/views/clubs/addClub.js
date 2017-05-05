AutoForm.addHooks(['insertClubForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('clubs');
	    Bert.alert("successfully added the club", 'success');
	}
});
