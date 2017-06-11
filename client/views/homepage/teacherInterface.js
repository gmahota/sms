Template.teacherInterface.onCreated(function() {
});

Template.teacherInterface.helpers({
	subjectsExist: function() {
		var id = Meteor.userId();
		var subjectCount = Meteor.users.findOne({_id: id}).profile.subjects;
		if (subjectCount.length > 0){
			return true;
		} else {
			return false;
		}
	},
	subjectsTaught: function(){
		var id = Meteor.userId();
		return Meteor.users.findOne({_id: id}).profile.subjects;
	},
	subjectName: function(){
		var subjectId = this;
		var obj = subjectId.valueOf();
		return Subjects.findOne({_id: obj}).name;
	}
});
