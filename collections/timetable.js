Timetables = new Mongo.Collection('timetables');

Timetables.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	},
	remove: function(userId, doc) {
		return true;
	}
});


Meteor.methods({
	deleteTimetable: function(id){
		Timetables.remove(id);
		FlowRouter.go('timetables');
	},
    createTimetable: function(year, term, classId, classDetailsArray){
        if (classDetailsArray.length >= 43){
        	Timetables.insert({
        		year: year,
        		term: term,
        		class: classId,
        		sessions: classDetailsArray
        	}, (error) => {
                if (error){
                    console.log('here it is');
                } else {
                	console.log('success');
                }
            });
            return;
        } else {
            throw new Meteor.Error(404,"Please add all subjects and teachers.");
            return;
        }
    }
});
