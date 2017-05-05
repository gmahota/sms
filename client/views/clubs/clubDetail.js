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
    'click .delete-club': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteClub', id);
	}
});
