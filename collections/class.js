Classes = new Mongo.Collection('classes');

if ( Meteor.isServer ) {
  Classes._ensureIndex( { streamName: 1, Form: 1, _id: 1 } );
}

Classes.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

ClassSchema = new SimpleSchema({
    streamName: {
		type: String
	},
    Form: {
        type: Number,
        label: "the form of the class",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"1", label: "1"},
                {value:"2", label: "2"},
                {value:"3", label: "3"},
                {value:"4", label: "4"}
            ]
        }
    },
	createdAt: {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();  // Prevent user from supplying their own val
			}
		},
		autoform: {
			type: "hidden"
		}
	},
	updatedAt: {
		type: Date,
		autoValue: function() {
			if (this.isUpdate) {
				return new Date();
			}
		},
		denyInsert: true,
		optional: true,
		autoform: {
			type: "hidden"
		}
	}
});

Meteor.methods({
	deleteClass: function(id){
		Classes.remove(id);
		FlowRouter.go('classes');
	},
    'classResultsPdf': function(classId, examId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "class-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('class_report', Assets.getText('class-report.html'));

          // PREPARE DATA

            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var classForm = Classes.findOne({_id: classId}).Form;
            var classStreamName = Classes.findOne({_id: classId}).streamName;

            var subject = Subjects.find();
            var studentIdArray = Students.find({class: classId}).map(function(student){
                return student._id;
            });
            var resultArray = [];
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstName = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                // var subjectObj =
                // var subjectIds = result.subjects.map(function(sub){
                //     return sub._id;
                // });
                var overallScore = result.overallScore;
                var overallGrade = result.overallGrade;
                var subjectData = [];
                var subjectMainData = Subjects.find().map(function(subj){
                    var subjectId = subj._id;
                    var doneSubjects = result.subjects;
                    console.log('here boogoe', doneSubjects);
                    var graded = false;
                    var score = 0;

                    var sense = doneSubjects.map(function(dsub){
                        if (dsub){
                            if (subjectId == dsub.subject){
                                graded = true;
                                score = dsub.score;
                            }
                        }
                    });

                    subjectData.push({
                        graded: graded,
                        subjectScore: score
                    });
                });

                resultArray.push({
                    resultId: resultId,
                    studentFirstName: studentFirstName,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectData: subjectData,
                    overallScore: overallScore,
                    overallGrade: overallGrade
                });
            });



            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: classForm,
                classStreamName: classStreamName,
                subject: subject,
                result: resultArray
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_report",
                data: data
            });

            console.log(html_string);
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "format": "Letter",
                    "orientation": "landscape",
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

Classes.attachSchema ( ClassSchema );
