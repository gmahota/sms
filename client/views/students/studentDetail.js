Template.studentDetail.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam('id');
		self.subscribe('singleStudent', id);
        var imageId = Students.findOne({_id: id}).image;
        self.subscribe('singleStudentImage', imageId);
		var classId = Students.findOne({_id: id}).class;
		self.subscribe('singleClass', classId);
		self.subscribe('clubs');
		self.subscribe('sports');
	});
});

Template.studentDetail.helpers({
    student: ()=> {
		var id = FlowRouter.getParam('id');
		return Students.findOne({_id: id});
	},
	className: ()=> {
		var id = FlowRouter.getParam('id');
		var classId = Students.findOne({_id: id}).class;
		var classForm =  Classes.findOne({_id: classId}).Form;
		var classStreamName =  Classes.findOne({_id: classId}).streamName;
		return(classForm + " " + classStreamName);
	},
	clubName: function() {
		var clubId = this;
		var obj = clubId.valueOf();
		return Clubs.findOne({_id: obj}).name;
	},
	sportName: function() {
		var sportId = this;
		var obj = sportId.valueOf();
		return Sports.findOne({_id: obj}).name;
	},
	yearSelection: function(){
		var data = [
			{year:"2017"},
			{year:"2018"},
			{year:"2019"},
			{year:"2020"},
			{year:"2021"},
			{year:"2022"},
			{year:"2023"},
			{year:"2024"},
			{year:"2025"},
			{year:"2026"},
			{year:"2027"}
		];
		return data;
	},
	term: function(){
		var data = [
			{termValue:"first-term"},
			{termValue:"second-term"},
			{termValue:"third-term"}
		];
		return data;
	}
});

Template.studentDetail.events({
    'click .deactivate-student': function(){
		var id = FlowRouter.getParam('id');
		Meteor.call('deactivateStudent', id, function(err, res){
			if (err) {
				Bert.alert(err.reason, 'danger');
			} else if (res){
				Bert.alert('student has been deactivated', 'danger');
				FlowRouter.go('students');
			}
		});
	},
	'click .generate-report': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var id = FlowRouter.getParam('id');
		var termName = $('[name=term-selection]').val();
		var year = $('[name=year-selection]').val();

		if (!year) {
			$('.processing').removeClass('show');
			Bert.alert('select the year for you to generate a report card', 'danger');
			return;
		} else {
			if (!termName) {
				$('.processing').removeClass('show');
				Bert.alert('select the term for you to generate a report card', 'danger');
				return;
			} else {
				Meteor.call('termReport', id, termName, year, function(err, res) {
			    	if (err) {
						$('.processing').removeClass('show');
						Bert.alert(err.reason, 'danger');
			      	} else if (res) {
						$('.processing').removeClass('show');
						Bert.alert('the file is ready', 'success');
						window.open("data:application/pdf;base64, " + res, '_blank');
			      	}
			    })
			}
		}
	}
});
