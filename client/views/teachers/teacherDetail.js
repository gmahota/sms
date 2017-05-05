Template.teacherDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleTeacher', id);
        var imageId = Teachers.findOne({_id: id}).image;
        self.subscribe('singleTeacherImage', imageId);
		self.subscribe('subjects');
	});
});

Template.teacherDetail.helpers({
    teacher: ()=> {
		var id = FlowRouter.getParam('id');
		return Teachers.findOne({_id: id});
	},
	subjectName: function() {
		var subjectId = this;
		var obj = subjectId.valueOf();
		return Subjects.findOne({_id: obj}).name;
	}
});

Template.teacherDetail.events({
    'click .delete-teacher': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deleteTeacher', id);
	}
});
