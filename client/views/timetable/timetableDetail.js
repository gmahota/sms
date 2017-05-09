Template.timetableDetail.onCreated(function() {
	var self = this;
	self.autorun(function(){
        var id = FlowRouter.getParam('id');
		self.subscribe('singleTimetable', id);
        self.subscribe('classes');
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

            //var endTime = sessions[i].endTime;
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
            groups[startTime].push({
                dayOfWeek: dayOfWeek,
                monday: monday,
                tuesday: tuesday,
                wednesday: wednesday,
                thursday: thursday,
                friday: friday,
                subject: sessions[i].subject,
                teacher: sessions[i].teacher,
            });
        }
        for (var startTime in groups) {
            timeObject.push({
                group: startTime,
                isClass: true,
                session: groups[startTime]
            });
        }
        console.log(timeObject);
        return timeObject;
    },
    studentImage: function() {
        var resultId = FlowRouter.getParam('id');
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).image;
    }
});

Template.timetableDetail.events({
    'click .delete-timetable': function(){
        var id = FlowRouter.getParam('id');
        Meteor.call('deleteTimetable', id);
    }
});
