Template.teacherDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleUser', id);
        var imageId = Meteor.users.findOne({_id: id}).image;
        self.subscribe('userImage');
		self.subscribe('subjects');
	});
});

Template.teacherDetail.helpers({
    user: ()=> {
		var id = FlowRouter.getParam('id');
		return Meteor.users.findOne({_id: id});
	},
	usrImage: function(){
		var id = FlowRouter.getParam('id');
		return Meteor.users.findOne({_id: id}).image;
	},
	subjectName: function() {
		var subjectId = this;
		var obj = subjectId.valueOf();
		return Subjects.findOne({_id: obj}).name;
	},
	subjectsExist: function(){
		var id = FlowRouter.getParam('id');
		var subjectArray = Meteor.users.findOne({_id: id}).profile.subjects;
		if (subjectArray.length > 0){
			return true;
		} else {
			return false;
		}
	}
});

Template.teacherDetail.events({
    'click .deactivate-teacher': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateTeacher', id);
	}
});
