Template.studentDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleStudent', id);
        var imageId = Students.findOne({_id: id}).image;
        self.subscribe('singleStudentImage', imageId);
		var classId = Students.findOne({_id: id}).class;
		self.subscribe('singleClass', classId);
		self.subscribe('clubs');
		self.subscribe('sports');
	});
});

Template.studentDetail.helpers({
    student: ()=> {
		var id = FlowRouter.getParam('id');
		return Students.findOne({_id: id});
	},
	className: ()=> {
		var id = FlowRouter.getParam('id');
		var classId = Students.findOne({_id: id}).class;
		var classForm =  Classes.findOne({_id: classId}).Form;
		var classStreamName =  Classes.findOne({_id: classId}).streamName;
		return(classForm + " " + classStreamName);
	},
	clubName: function() {
		var clubId = this;
		var obj = clubId.valueOf();
		return Clubs.findOne({_id: obj}).name;
	},
	sportName: function() {
		var sportId = this;
		var obj = sportId.valueOf();
		return Sports.findOne({_id: obj}).name;
	}
});

Template.studentDetail.events({
    'click .delete-student': function(){
		var id = FlowRouter.getParam('id');
        var imageId = Students.findOne({_id: id}).image;
		Meteor.call('deleteStudent', id, imageId);
	}
});
