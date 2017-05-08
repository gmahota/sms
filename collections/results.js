Results = new Mongo.Collection('results');

if ( Meteor.isServer ) {
  Results._ensureIndex( { name: 1, _id: 1 } );
}

Results.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

SubjectSchema = new SimpleSchema({
    subject: {
        type: String,
        label: "the subject",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Subjects.find({}).forEach(function (element) {
                    options.push({
                        label: element.name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    grade: {
        type: String,
        label: "grade",
    },
    points: {
        type: Number,
        max: 12
    },
    score: {
        type: Number,
        label: "score",
        min: 0,
        max: 100
    },
    comments: {
        type: String,
        optional: true,
        label: "remarks (optional)"
    }
});

ResultSchema = new SimpleSchema({
    student: {
        type: String,
        label: "select the student",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: false
	      	},
            options: function () {
                var options = [];
                Students.find({}).forEach(function (element) {
                    var name = element.firstName + " " + element.surname + " | " + element.registrationNumber
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    exam: {
        type: String,
        label: "the exam",
        autoform: {
        	type: 'select2',
            options: function () {
                var options = [];
                Exams.find({}).forEach(function (element) {
                    var name = element.type + " | " + element.term + " | " + element.year
                    options.push({
                        label: name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    subjects: {
        type: [SubjectSchema],
        label: "Subjects"
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
    overallScore: {
        type: Number,
        min:0
    },
    overallGrade: {
        type: String,
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
	deleteResult: function(id){
		Results.remove(id);
		FlowRouter.go('results');
	},
    'resultPdf': function(id) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "student-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('student_report', Assets.getText('student-report.html'));

          // PREPARE DATA

            var result =Results.findOne({_id: id});

            var studentId = Results.findOne({_id: id}).student;
            var studentImage = Students.findOne({_id: studentId}).image;

            var studentFirstName = Students.findOne({_id: studentId}).firstName;

            var studentLastName = Students.findOne({_id: studentId}).surname;

            var studentRegistrationNumber = Students.findOne({_id: studentId}).registrationNumber;

            var studentYear = Students.findOne({_id: studentId}).yearOfAdmission;

            var classId = Students.findOne({_id: studentId}).class;
            var studentClassStreamName = Classes.findOne({_id: classId}).streamName;

            var studentClassForm = Classes.findOne({_id: classId}).Form;

            var examId = Results.findOne({_id: id}).exam;
            var examType = Exams.findOne({_id: examId}).type;

            var examTerm = Exams.findOne({_id: examId}).term;

            var examYear = Exams.findOne({_id: examId}).year;

            var subjectCount = Results.findOne({_id: id}).subjects.length;

            var subjectsArray = [];
            var subjectData = Results.findOne({_id: id}).subjects.map(function(subject){
                var subjId = subject.subject;
                var subjectName = Subjects.findOne({_id: subjId}).name;
                var score = subject.score;
                var points = subject.points;
                var grade = subject.grade;
                var comments = subject.comments;

                subjectsArray.push({
                    subjectName: subjectName,
                    score: score,
                    points: points,
                    grade: grade,
                    comments: comments,
                    subject: subjId
                });
            });
            console.log(subjectsArray);
            // var subjectName = Subjects.findOne({_id: myId}).name;

            var data = {
                result: result,
                studentImage: studentImage,
                studentFirstName: studentFirstName,
                studentLastName: studentLastName,
                studentRegistrationNumber: studentRegistrationNumber,
                studentYear: studentYear,
                studentClassStreamName: studentClassStreamName,
                studentClassForm: studentClassForm,
                examType: examType,
                examTerm: examTerm,
                examYear: examYear,
                subjectCount: subjectCount,
                subjects: subjectsArray
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "student_report",
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

Results.attachSchema ( ResultSchema );
