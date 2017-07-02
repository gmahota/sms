Template.addTimetable.onCreated(function() {
	var self = this;
	self.autorun(function(){
		self.subscribe('subjects');
        self.subscribe('classes');
        self.subscribe('timetables');
		self.subscribe('teachers');
	});

	Session.set("year", null);
	Session.set("term", null);
	Session.set("classId", null);
});

Template.addTimetable.helpers({
	classTimes: function(){
		var classTimes = [
			{
				startTime: "8:00",
				endTime: "8:40",
				break: false
			},
			{
				startTime: "8:40",
				endTime: "9:20",
				break: false
			},
			{
				startTime: "9:20",
				endTime: "9:30",
				break: true
			},
			{
				startTime: "9:30",
				endTime: "10:10",
				break: false
			},
			{
				startTime: "10:10",
				endTime: "10:50",
				break: false
			},
			{
				startTime: "10:50",
				endTime: "11:20",
				break: true
			},
			{
				startTime: "11:20",
				endTime: "12:00",
				break: false
			},
			{
				startTime: "12:00",
				endTime: "12:40",
				break: false
			},
			{
				startTime: "12:40",
				endTime: "13:20",
				break: true
			},
			{
				startTime: "13:20",
				endTime: "14:00",
				break: true
			},
			{
				startTime: "14:00",
				endTime: "14:40",
				break: false
			},
			{
				startTime: "14:40",
				endTime: "15:20",
				break: false
			},
			{
				startTime: "15:20",
				endTime: "16:00",
				break: false
			}
		];
		return classTimes;
	},
	class: function(){
		return Classes.find({active: true});
	},
	years: function(){
		var yearsArr = [
			{year: "2017"},
			{year: "2018"},
			{year: "2019"},
			{year: "2020"},
			{year: "2021"},
			{year: "2022"},
			{year: "2023"},
			{year: "2024"},
			{year: "2025"},
			{year: "2026"},
			{year: "2027"}
		];
		return yearsArr;
	},
	term: function(){
		var termData = [
			{termName: "first-term"},
			{termName: "second-term"},
			{termName: "third-term"}
		];
		return termData;
	},
	subject: function(){
		return Subjects.find();
	},
	teacher: function(){
		return Meteor.users.find();
	}
});

Template.addTimetable.events({
	'change .class-list': function(event, template){
		var myList = document.getElementById("class-list");
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('classId', selectedValue );
		}
	},
	'change .term-list': function(event, template){
		var myList = document.getElementById("term-list");
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('term', selectedValue );
		}
	},
	'change .year-list': function(event, template){
		var myList = document.getElementById("year-list");
		var selectedValue = myList.options[myList.selectedIndex].value;
		if (selectedValue) {
			Session.set('year', selectedValue );
		}
	},
	'click .save-timetable': function(event, template){
		var year = Session.get('year');
		var term = Session.get('term');
		var classId = Session.get('classId');
		var classDetailsArray = [];

		if (!year){
			$('.year-list').addClass('field-red');
			$('.term-list').removeClass('field-red');
			$('.class-list').removeClass('field-red');
			var message = "you need to choose the year";
			Bert.alert(message, 'danger');
			return;
		} else if (!term){
			$('.year-list').removeClass('field-red');
			$('.class-list').removeClass('field-red');
			$('.term-list').addClass('field-red');
			var message = "you need to choose the term for the timetable";
			Bert.alert(message, 'danger');
			return;
		} else if (!classId){
			$('.year-list').removeClass('field-red');
			$('.term-list').removeClass('field-red');
			$('.class-list').addClass('field-red');
			var message = "you need to choose the class to whom this timetable will apply";
			Bert.alert(message, 'danger');
			return;
		} else {
			$('.year-list').removeClass('field-red');
			$('.term-list').removeClass('field-red');
			$('.class-list').removeClass('field-red');

			$('tr.timeline').each(function() {
				var row = this;
				var startTime = $(this).attr('id');
				$('.timeline-date').each(function(){
					var dayOfWeek = $(this).attr('id');
					var subjectId = "";
					var teacherId = "";
					var endTime = "";

					$('.subject-list', this).each(function() {
						subjectId = $(this).val();
						if (!subjectId){
							$(this).addClass('field-red');
							return;
						} else {
							$(this).removeClass('field-red');
						}
					});
					$('.teacher-list', this).each(function() {
						teacherId = $(this).val();
						if (!teacherId){
							$(this).addClass('field-red');
							return;
						} else {
							$(this).removeClass('field-red');
						}
					});

					if (teacherId == "" && studentId == ''){
						return;
					} else {
						if (startTime == "8:00"){
							endTime = "8:40"
						} else if (startTime == "8:40"){
							endTime = "9:20"
						} else if (startTime == "9:20"){
							endTime = "9:30"
						} else if (startTime == "9:30"){
							endTime = "10:10"
						} else if (startTime == "10:10"){
							endTime = "10:50"
						} else if (startTime == "10:50"){
							endTime = "11:20"
						} else if (startTime == "11:20"){
							endTime = "12:00"
						} else if (startTime == "12:00"){
							endTime = "12:40"
						} else if (startTime == "12:40"){
							endTime = "13:20"
						} else if (startTime == "13:20"){
							endTime = "14:00"
						} else if (startTime == "14:00"){
							endTime = "14:40"
						} else if (startTime == "14:40"){
							endTime = "15:20"
						} else if (startTime == "15:20"){
							endTime = "16:00"
					 	}

						classDetailsArray.push({
					        dayOfWeek: dayOfWeek,
					        startTime: startTime,
							endTime: endTime,
					        subject: subjectId,
					        teacher: teacherId
					    });
					}
				});
			});

			//QUICK FIX
			var noDupeObj = {}
		    for (i = 0, n = classDetailsArray.length; i < n; i++) {
		    	var item = classDetailsArray[i];
		    	noDupeObj[item.dayOfWeek + "|" + item.startTime] = item;
		    }
		    var i = 0;
		    var cleanData = [];
		    for (var item in noDupeObj) {
		    	cleanData[i++] = noDupeObj[item];
		    }

			if (cleanData.length == 45){
				$('.processing').addClass('show');
				if ($('.show.processing').length > 0){
					Meteor.call('createTimetable', year, term, classId, cleanData, function(err, res) {
				    	if (err) {
							$('.processing').removeClass('show');
							Bert.alert(err.reason, 'danger');
				      	} else {
							$('.processing').removeClass('show');
							FlowRouter.go('timetables');
				            Bert.alert('added the timetable successfully', 'success');
				      	}
				    });
				}
			} else {
				throw new Error('This is not an error. This is just to abort javascript');
			}

		}
	}
});
