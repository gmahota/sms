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
    'click .delete-sport': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteSport', id);
	}
});
