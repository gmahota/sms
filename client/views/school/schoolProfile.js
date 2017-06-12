Template.schoolProfile.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleSchool', id);
        self.subscribe('schoolImages');
	});
});

Template.schoolProfile.helpers({
    school: ()=> {
		var id = FlowRouter.getParam('id');
		return Schools.findOne({_id: id});
	}
});
