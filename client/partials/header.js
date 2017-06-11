Template.header.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('allUsers');
		self.subscribe('userImage');
	});
});

Template.header.helpers({
	usrImageExists: function(){
		var id = Meteor.userId();
		if (Meteor.users.findOne({_id: id}).image != null){
			return true;
		} else {
			return false;
		}
	},
	usrImage: function(){
		var id = Meteor.userId();
		return Meteor.users.findOne({_id: id}).image;
	},
    thisUser: function(){
        var id = Meteor.userId();
        var thisUser = Meteor.users.findOne({_id: id});
        return thisUser;
    }
});

Template.header.events({
    'click .logout': function(event, error){
        event.preventDefault();
        Meteor.logout();
    },
    'click .sidebar-link': function(event){
    	var $lateral_menu_trigger = $('#menufy-menu-trigger'),
			$content_wrapper = $('.menufy-main-content'),
			$navigation = $('header');
		$lateral_menu_trigger.toggleClass('is-clicked');
		$navigation.toggleClass('lateral-menu-is-open');
		$content_wrapper.toggleClass('lateral-menu-is-open');
		$('body').toggleClass('overflow-hidden');
		$('#menufy-lateral-nav').toggleClass('lateral-menu-is-open');
    }
});
