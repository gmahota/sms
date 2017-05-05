Template.classDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClass', id);
	});
});

Template.classDetail.helpers({
    class: ()=> {
		var id = FlowRouter.getParam('id');
		return Classes.findOne({_id: id});
	}
});

Template.classDetail.events({
    'click .delete-class': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteClass', id);
	}
});
