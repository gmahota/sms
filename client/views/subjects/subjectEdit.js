Template.subjectEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSubject', id);
		self.subscribe('teachers');
	});
});

Template.subjectEdit.helpers({
    subject: ()=> {
		var id = FlowRouter.getParam('id');
		return Subjects.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateSubjectId'], {
	onSuccess: function(operation, result, template) {
		var id = FlowRouter.getParam('id');
	    Bert.alert("updating results", 'success');
		Meteor.call('updateSubjectGradeChange', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else {
				Bert.alert('results have been updated', 'success');
				FlowRouter.go('subjects');
			}
		});
	}
});
