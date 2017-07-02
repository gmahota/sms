Template.subjectDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSubject', id);
        self.subscribe('teachers');
		self.subscribe('teacherImages');
	});
});

Template.subjectDetail.helpers({
    subject: ()=> {
		var id = FlowRouter.getParam('id');
		return Subjects.findOne({_id: id});
	},
	subjectMasterName: ()=> {
		var id = FlowRouter.getParam('id');
		var teacherId = Subjects.findOne({_id: id}).subjectMaster;
		var teacher = Teachers.findOne({_id: teacherId});
		return(teacher.firstName + " " + teacher.surname);
	},
	subjectMasterImage: ()=> {
		var id = FlowRouter.getParam('id');
		var teacherId = Subjects.findOne({_id: id}).subjectMaster;
		var teacher = Teachers.findOne({_id: teacherId});
		return teacher.image;
	}
});

Template.subjectDetail.events({
    'click .deactivate-subject': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateSubject', id);
	},
	'click .deactivate-subject': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateSubject', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('subject has been deactivated', 'danger');
				FlowRouter.go('classes');
			}
		});
	}
});
