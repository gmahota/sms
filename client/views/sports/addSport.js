AutoForm.addHooks(['insertSportForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('sports');
	    Bert.alert("successfully added the sport", 'success');
	}
});
