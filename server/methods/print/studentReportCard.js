Meteor.methods({
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

          SSR.compileTemplate('layout', Assets.getText('layoutPortrait.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('student_report', Assets.getText('student-report.html'));

          // PREPARE DATA

            var result = Results.findOne({_id: id});

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
                var selected = subject.selected;

                subjectsArray.push({
                    subjectName: subjectName,
                    score: score,
                    points: points,
                    grade: grade,
                    comments: comments,
                    subject: subjId,
                    selected: selected
                });
            });

            var validSubjects = subjectsArray.filter(function( scienceObj ) {
              return scienceObj.selected == true;
            });
            var validSubjectCount = validSubjects.length;

            var studentGender = Students.findOne({_id: studentId}).gender;

            var classMatesIds = Students.find({class: classId}).map(function(classmate){
                return classmate._id;
            });


            var scores = Results.find({ exam: examId, student: {$in: classMatesIds}}).map(function(result){
                return result.overallScore;
            });
            var pos = scores.sort(function(a, b){return b-a});
    		var jsPosition = pos.indexOf(result.overallScore);
    		var position = (jsPosition + 1);

            var streamClasses = Classes.find({Form: (studentClassForm * 1)}).map(function(cl){
                return cl._id;
            });
            var streamMatesIds = Students.find({class: {$in: streamClasses}}).map(function(classmate){
                return classmate._id;
            });
            var streamScores = Results.find({ exam: examId, student: {$in: streamMatesIds}}).map(function(result){
                return result.overallScore;
            });
            var streamPos = streamScores.sort(function(a, b){return b-a});
    		var jsStreamPosition = streamPos.indexOf(result.overallScore);
    		var streamPosition = (jsStreamPosition + 1);

            var averageScore = 0;
            if (result.overallMean){
                averageScore = (result.overallMean).toFixed(1);
            } else {
                averageScore = parseInt((result.overallScore / validSubjectCount) * 1);
            }

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
                subjects: subjectsArray,
                studentGender: studentGender,
                position: position,
                streamPosition: streamPosition,
                averageScore: parseInt(averageScore),
                classNumber: scores.length,
                streamNumber: streamScores.length
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "student_report",
                data: data
            });

            console.log("everything is alright");
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "width": "2480px",
                    "height": "3508px",
                    "margin": "150px"
                },
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
