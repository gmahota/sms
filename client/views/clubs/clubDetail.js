Template.clubDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClub', id);
	});
});

Template.clubDetail.helpers({
    club: ()=> {
		var id = FlowRouter.getParam('id');
		return Clubs.findOne({_id: id});
	}
});

Template.clubDetail.events({
    'click .deactivate-club': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateClub', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('club deactivated', 'danger');
				FlowRouter.go('clubs');
			}
		});
	}
});
