Template.homepage.onCreated(function() {
	var self = this;
	self.autorun(function() {
        self.subscribe('students');
        self.subscribe('subjects');
		self.subscribe('classes');
        self.subscribe('teachers');
	});
});
