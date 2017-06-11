Template.teachers.onCreated(function() {
	var self = this;
	self.autorun(function(){
        self.subscribe('userImage');
		self.subscribe('teachers');
	});
});

Template.teachers.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	teacher: ()=> {
		return Meteor.users.find({'roles.__global_roles__':'teacher'}).fetch();
	}
});
