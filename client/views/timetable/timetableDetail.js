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
        for (var i = 0; i < timeObject.length; i++) {
            var startTime = sessions[i].startTime;
            if (!groups[startTime]) {
                groups[startTime] = [];
            }
            groups[startTime].push(sessions[i].color);
        }
        for (var startTime in groups) {
            timeObject.push({
                group: startTime,
                color: groups[startTime]
            });
        }

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
