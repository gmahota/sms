Template.addResult.onCreated(function() {
	var self = this;
	self.autorun(function() {
        self.subscribe('students');
        self.subscribe('subjects');
        self.subscribe('exams');
		self.subscribe('classes');
        self.subscribe('teachers');
	});

	Session.set("examId", null);
	Session.set("classId", null);

	self.examSelection = new ReactiveVar(false);
	self.classSelection = new ReactiveVar(false);

});

Template.addResult.helpers({
	subjectsAvailable: ()=> {
		return Subjects.find().fetch().reverse();
	},
	student: ()=> {
		var examSelection = Template.instance().examSelection.get();
		var classSelection = Template.instance().classSelection.get();
		var examId = Session.get('examId');
		var classId = Session.get('classId');
		if (examSelection){
			if(examId){
				if(classSelection){
					if(classId){
						return Students.find({class: classId}).fetch().reverse();
					} else {
						return Students.find({class: "123"});
					}
				} else {
					return
				}
			} else {
				return
			}
		} else {
			return
		}
	},
	class: ()=> {
		var examSelection = Template.instance().examSelection.get();
		var examId = Session.get('examId');
		if (examSelection){
			if(examId){
				var classIdArray = Exams.findOne({_id: examId}).classes;
				return Classes.find({_id: { $in: classIdArray }}).fetch().reverse();
			} else {
				return
			}
		} else {
			return
		}
	},
	colCount: function(){
		var subjectCount = Subjects.find().count();
		return (subjectCount + 2);
	},
	exam: ()=> {
		return Exams.find().fetch().reverse();
	},
	examSelected: function(){
		return Template.instance().examSelection.get();
	},
	classSelected: function(){
		return Template.instance().classSelection.get();
	}
});

Template.addResult.events({
	'change .exam-list': function(event, template){
		var myList = document.getElementById("examList");
		var examSelected = Template.instance().examSelection.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('examId', selectedValue );
			Session.set('classId', null );
			if (examSelected){
				template.examSelection.set(false);
				template.examSelection.set(true);
			} else {
				template.examSelection.set(true);
			}
			template.classSelection.set(false);
		}
	},
	'change .class-list': function(event, template){
		var myList = document.getElementById("classList");
		var classSelected = Template.instance().examSelection.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('classId', selectedValue );
			if (classSelected){
				template.classSelection.set(false);
				template.classSelection.set(true);
			} else {
				template.classSelection.set(true);
			}
		}
	}
});
