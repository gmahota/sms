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
    },
	'timetablePdf': function(id) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "class-timetable.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('class_timetable', Assets.getText('class-timetable.html'));

          // PREPARE DATA

		  var timetable = Timetables.findOne({_id: id});

		  var classId = Timetables.findOne({_id: id}).class;
		  var classForm = Classes.findOne({_id: classId}).Form;
		  var classStreamName = Classes.findOne({_id: classId}).streamName;

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
			  var time = timeObject;
            var data = {
                timetable: timetable,
                classForm: classForm,
                classStreamName: classStreamName,
                time: time
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_timetable",
                data: data
            });

            console.log(html_string);
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "format": "Letter",
                    "orientation": "portrait",
                    "margin": "1cm"
                },
                //phantomPath: require('phantomjs').path,
                "phantomPath": "/usr/local/bin/phantomjs",
                siteType: 'html'
            };

            // Commence Webshot
            console.log("Commencing webshot...");
            webshot(html_string, fileName, options, function(err) {
                fs.readFile(fileName, function (err, data) {
                    if (err) {
                        console.log('oh shit1');
                        console.log(err);
                        return;
                    }
                    fs.unlinkSync(fileName);
                    fut.return(data);
                });
            });
            let pdfData = fut.wait();
            let base64String = new Buffer(pdfData).toString('base64');
            return base64String;
        }
    }
});
