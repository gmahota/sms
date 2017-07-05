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
		self.subscribe('studentResults', id);
		self.subscribe('exams');
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
		var resultsExamsIds = Results.find({}).map(function(res){
			return res.exam;
		});
		var data = Exams.find({_id: {$in: resultsExamsIds},active: true}).map(function(exam){
			return exam.year;
		});

		var noDupeObj = {}
        for (i = 0, n = data.length; i < n; i++) {
            var item = data[i];
            noDupeObj[item] = item;
        }
        var i = 0;
        var cleanData = [];
        for (var item in noDupeObj) {
            cleanData[i++] = noDupeObj[item];
        }
        return cleanData
	},
	term: function(){
		var resultsExamsIds = Results.find({}).map(function(res){
			return res.exam;
		});
		var data = Exams.find({_id: {$in: resultsExamsIds},active: true}).map(function(exam){
			return exam.term;
		});
		
		var noDupeObj = {}
        for (i = 0, n = data.length; i < n; i++) {
            var item = data[i];
            noDupeObj[item] = item;
        }
        var i = 0;
        var cleanData = [];
        for (var item in noDupeObj) {
            cleanData[i++] = noDupeObj[item];
        }
        return cleanData
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
