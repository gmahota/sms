Template.editSchool.onCreated(function() {
	var self = this;
	self.autorun(function() {
		//fix for race condition
		const schoolId = Meteor.user() && Meteor.user().profile.schoolId;

		if (schoolId){
			self.subscribe('singleSchool', schoolId);
		}
	});
});

AutoForm.addHooks(['insertClassForm'], {
	onSuccess: function(operation, result, template) {
		FlowRouter.go('classes');
	    Bert.alert("successfully added the class", 'success');
	}
});
