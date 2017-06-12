Template.header.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('allUsers');
		self.subscribe('userImage');

		//fix for race condition
		const schoolId = Meteor.user() && Meteor.user().profile.schoolId;

		if (schoolId){
			self.subscribe('singleSchool', schoolId);
		}
		self.subscribe('schoolImages');
	});
});

Template.header.helpers({
	schoolLogoExists: function(){
		if (Meteor.user()){
			var schoolId = Meteor.user().profile.schoolId;
			var schoolData = Schools.findOne({_id: schoolId}).logo;
			if (schoolData){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},
	schoolLogo: function(){
		if (Meteor.user()){
			var schoolId = Meteor.user().profile.schoolId;
			var schoolData = Schools.findOne({_id: schoolId}).logo;
			return schoolData;
		}
	},
	schoolName: function(){
		if (Meteor.user()){
			var schoolId = Meteor.user().profile.schoolId;
			var schoolData = Schools.findOne({_id: schoolId}).name;
			return schoolData;
		}
	},
	usrImageExists: function(){
		if (Meteor.user()){
			if (Meteor.user().image != null){
				return true;
			} else {
				return false;
			}
		}
	},
	usrImage: function(){
		if (Meteor.user()){
			return Meteor.user().image;
		}
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
		FlowRouter.go('login');
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
