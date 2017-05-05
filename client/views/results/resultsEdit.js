Template.resultEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleResult', id);
		self.subscribe('students');
		self.subscribe('subjects');
		self.subscribe('exams');
	});
});

Template.resultEdit.helpers({
    result: ()=> {
		var id = FlowRouter.getParam('id');
		return Results.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateResultForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('results');
	    Bert.alert("successfully updated", 'success');
	}
});
