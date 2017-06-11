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

            var subject = [];
            var subjectObj = Subjects.find().map(function(sub){
                var name = sub.name;
                var shortName = name.substring(0, 3);
                subject.push({
                    name: name,
                    shortName: shortName
                });
            });
            var studentIdArray = Students.find({class: classId}).map(function(student){
                return student._id;
            });
            var resultArray = [];
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstNameLong = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var studentFirstName = studentFirstNameLong.substring(0, 1);
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                // var subjectObj =
                // var subjectIds = result.subjects.map(function(sub){
                //     return sub._id;
                // });
                var overallScore = result.overallScore;
                var overallGrade = result.overallGrade;
                var meanGrade = parseInt((overallScore / result.subjects.length) * 1);
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

                var classMatesIds = Students.find({class: classId}).map(function(classmate){
                    return classmate._id;
                });
                var scores = Results.find({ exam: examId, student: {$in: classMatesIds}}).map(function(result){
                    return result.overallScore;
                });
                var pos = scores.sort(function(a, b){return b-a});
        		var jsPosition = pos.indexOf(result.overallScore);
        		var position = (jsPosition + 1);

                resultArray.push({
                    resultId: resultId,
                    studentFirstName: studentFirstName,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectData: subjectData,
                    overallScore: overallScore,
                    overallGrade: overallGrade,
                    meanGrade: meanGrade,
                    position: position
                });
            });

            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
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
                    "format": "A4",
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
    },
    'classListPdf': function(classId, teacherId, subjectId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "class-list.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('class_list', Assets.getText('class-list.html'));

          // PREPARE DATA
            var classForm = Classes.findOne({_id: classId}).Form;
            var classStreamName = Classes.findOne({_id: classId}).streamName;
            var subjectName = Subjects.findOne({_id: subjectId}).name;
            var student = Students.find({class: classId});
            var teacherFirstname = Meteor.users.findOne({_id: teacherId}).profile.firstname;
            var teacherLastname = Meteor.users.findOne({_id: teacherId}).profile.lastname;

            var data = {
                subjectName: subjectName,
                teacherFirstname: teacherFirstname,
                teacherLastname: teacherLastname,
                classForm: classForm,
                classStreamName: classStreamName,
                student: student
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_list",
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
    },
    'combinedResultsPdf': function(classId, examId, form) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "combined-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('combined_report', Assets.getText('combined-report.html'));

          // PREPARE DATA

            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var subject = [];
            var subjectObj = Subjects.find().map(function(sub){
                var name = sub.name;
                var shortName = name.substring(0, 3);
                subject.push({
                    name: name,
                    shortName: shortName
                });
            });
            var studentIdArray = Students.find({class: {$in: classId}}).map(function(student){
                return student._id;
            });
            var resultArray = [];
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstNameLong = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var classIdStud = Students.findOne({_id: result.student}).class;
                var streamNameLong = Classes.findOne({_id: classIdStud}).streamName;
                var streamName = streamNameLong.substring(0, 1)
                var studentFirstName = studentFirstNameLong.substring(0, 1);
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                // var subjectObj =
                // var subjectIds = result.subjects.map(function(sub){
                //     return sub._id;
                // });
                var overallScore = result.overallScore;
                var overallGrade = result.overallGrade;
                var meanGrade = parseInt((overallScore / result.subjects.length) * 1);
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

                var classMatesIds = Students.find({class: {$in: classId}}).map(function(classmate){
                    return classmate._id;
                });
                var scores = Results.find({ exam: examId, student: {$in: classMatesIds}}).map(function(result){
                    return result.overallScore;
                });
                var pos = scores.sort(function(a, b){return b-a});
        		var jsPosition = pos.indexOf(result.overallScore);
        		var position = (jsPosition + 1);

                resultArray.push({
                    resultId: resultId,
                    studentFirstName: studentFirstName,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectData: subjectData,
                    overallScore: overallScore,
                    overallGrade: overallGrade,
                    meanGrade: meanGrade,
                    position: position,
                    streamName: streamName
                });
            });

            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
            });

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: form,
                subject: subject,
                result: resultArray
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "combined_report",
                data: data
            });

            console.log(html_string);
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "format": "A4",
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
    },
});

Classes.attachSchema ( ClassSchema );
