Template.timetableEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleTimetable', id);
	});
});

Template.timetableEdit.helpers({
    timetable: ()=> {
		var id = FlowRouter.getParam('id');
		return Timetables.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateTimetableForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('timetables');
	    Bert.alert("successfully updated", 'success');
	}
});
