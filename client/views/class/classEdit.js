Template.classEdit.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleClass', id);
	});
});

Template.classEdit.helpers({
    class: ()=> {
		var id = FlowRouter.getParam('id');
		return Classes.findOne({_id: id});
	}
});

AutoForm.addHooks(['updateClassId'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('classes');
	    Bert.alert("successfully updated", 'success');
	}
});
