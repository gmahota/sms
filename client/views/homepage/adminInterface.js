Template.adminInterface.onCreated(function() {
});

Template.adminInterface.helpers({
	teachersCount: function() {
		return Meteor.users.find({'roles.__global_roles__':'teacher'}).count();
	},
    classesCount: function() {
		return Classes.find().count();
	},
    subjectsCount: function() {
		return Subjects.find().count();
	},
    studentsCount: function() {
		return Students.find().count();
	}
});
