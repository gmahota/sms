Template.timetableDetail.onCreated(function() {
	var self = this;
	self.autorun(function(){
        var id = FlowRouter.getParam('id');
		self.subscribe('singleTimetable', id);
        self.subscribe('classes');
		self.subscribe('subjects');
		self.subscribe('teachers');
	});
});

Template.timetableDetail.helpers({
	timetable: ()=> {
        var id = FlowRouter.getParam('id');
		return Timetables.findOne({_id: id});
	},
    classForm: function(){
        var id = FlowRouter.getParam('id');
        var classId = Timetables.findOne({_id: id}).class;
        return Classes.findOne({_id: classId}).Form;
    },
    classStreamName: function(){
        var id = FlowRouter.getParam('id');
        var classId = Timetables.findOne({_id: id}).class;
        return Classes.findOne({_id: classId}).streamName;
    },
    time: function(){
        var id = FlowRouter.getParam('id');
        var sessions = Timetables.findOne({_id: id}).sessions;
        var timeObject = [];

        var groups = {};
        for (var i = 0; i < sessions.length; i++) {
            var startTime = sessions[i].startTime;
            var dayOfWeek = sessions[i].dayOfWeek;
            var monday = false;
            var tuesday = false;
            var wednesday = false;
            var thursday = false;
            var friday = false;

            if(dayOfWeek == "Monday"){
                monday = true;
            } else if(dayOfWeek == "Tuesday"){
                tuesday = true;
            } else if(dayOfWeek == "Wednesday"){
                wednesday = true;
            } else if(dayOfWeek == "Thursday"){
                thursday = true;
            } else if(dayOfWeek == "Friday"){
                friday = true;
            }

            if (!groups[startTime]) {
                groups[startTime] = [];
            }
			var subject = Subjects.findOne({_id: sessions[i].subject}).name;
			var firstName = Teachers.findOne({_id: sessions[i].teacher}).firstName;
			var surname = Teachers.findOne({_id: sessions[i].teacher}).surname;

            groups[startTime].push({
                dayOfWeek: dayOfWeek,
                monday: monday,
                tuesday: tuesday,
                wednesday: wednesday,
                thursday: thursday,
                friday: friday,
                subject: subject,
                firstName: firstName,
				surname: surname
            });
        }
        for (var startTime in groups) {
			var endTime = "";
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

            timeObject.push({
                group: startTime,
                isClass: true,
                session: groups[startTime],
				ending: endTime
            });
        }
        return timeObject;
    }
});

Template.timetableDetail.events({
    'click .delete-timetable': function(){
        var id = FlowRouter.getParam('id');
        Meteor.call('deleteTimetable', id);
    },
	'click .print-timetable': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var id = FlowRouter.getParam('id');
	 	Meteor.call('timetablePdf', id, function(err, res) {
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
});
