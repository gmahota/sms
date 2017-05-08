Template.addTimetable.onCreated(function() {
	var self = this;
	self.autorun(function(){
		self.subscribe('subjects');
        self.subscribe('classes');
        self.subscribe('timetables');
	});
});

AutoForm.addHooks(['insertTimetableForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('timetables');
	    Bert.alert("successfully added the timetable", 'success');
	}
});
