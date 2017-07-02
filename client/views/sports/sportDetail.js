Template.sportDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSport', id);
	});
});

Template.sportDetail.helpers({
    sport: ()=> {
		var id = FlowRouter.getParam('id');
		return Sports.findOne({_id: id});
	}
});

Template.sportDetail.events({
    'click .deactivate-sport': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateSport', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('sport deactivated', 'danger');
				FlowRouter.go('sports');
			}
		});
	}
});
