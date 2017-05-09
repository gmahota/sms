Template.clubEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClub', id);
	});
});

Template.clubEdit.helpers({
    club: ()=> {
		var id = FlowRouter.getParam('id');
		return Clubs.findOne({_id: id});
	}
});

AutoForm.addHooks('updateClubId', {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('clubs');
	    Bert.alert("successfully updated", 'success');
	}
});
