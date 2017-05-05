Template.sportEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSport', id);
	});
});

Template.sportEdit.helpers({
    sport: ()=> {
		var id = FlowRouter.getParam('id');
		return Sports.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateSportForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('sports');
	    Bert.alert("successfully updated", 'success');
	}
});
