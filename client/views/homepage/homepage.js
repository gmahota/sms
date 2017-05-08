Template.homepage.onCreated(function() {
	var self = this;
	self.autorun(function() {
        self.subscribe('students');
        self.subscribe('subjects');
		self.subscribe('classes');
        self.subscribe('teachers');
	});
});

Template.homepage.helpers({
	teachersCount: function() {
		return Teachers.find().count();
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
