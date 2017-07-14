Meteor.methods({
    'subjectClassReport': function(classId, examId, subjectId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "subject-class-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('subject_class_report', Assets.getText('subject-class-report.html'));
            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var classForm = Classes.findOne({_id: classId}).Form;
            var classStreamName = Classes.findOne({_id: classId}).streamName;

            var subjectName = Subjects.findOne({_id: subjectId}).name;

            var resultDataArray = [];
            var studentIdArray = Students.find({class: classId}).map(function(student){
                return student._id;
            });
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstNameLong = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var studentFirstName = studentFirstNameLong.substring(0, 1);
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                var studentGender = Students.findOne({_id: result.student}).gender;

                var subjectScore = 0;
                var subjectPoints = 0;
                var subjectGrade = "-";
                var graded = false;
                var subjectDataCalc = result.subjects.map(function(subj){
                    if(subj.subject == subjectId){
                        graded = true;
                        subjectScore = subj.score;
                        subjectGrade = subj.grade;
                        subjectPoints = subj.points;
                    }
                });
                resultDataArray.push({
                    resultId: resultId,
                    studentGender: studentGender,
                    studentFirstName: studentFirstNameLong,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectScore: subjectScore,
                    subjectPoints: subjectPoints,
                    subjectGrade: subjectGrade,
                    graded: graded
                });
            });

            var resultArray = [];
            var resultArrPositioning = resultDataArray.map(function(data){
                var scores = resultDataArray.map(function(result){
                    return result.subjectScore;
                });
                var pos = scores.sort(function(a, b){return b-a});
                var jsPosition = pos.indexOf(data.subjectScore);
                var position = (jsPosition + 1);

                resultArray.push({
                    resultId: data.resultId,
                    studentGender: data.studentGender,
                    studentFirstName: data.studentFirstName,
                    studentLastName: data.studentLastName,
                    studentRegistrationNumber: data.studentRegistrationNumber,
                    subjectScore: data.subjectScore,
                    subjectPoints: data.subjectPoints,
                    subjectGrade: data.subjectGrade,
                    graded: data.graded,
                    position: position,
                });
            });

            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
            });

            //ANALYSIS TIME
            var availableGrades = [
                {grade: "A"},
                {grade: "A-"},
                {grade: "B+"},
                {grade: "B"},
                {grade: "B-"},
                {grade: "C+"},
                {grade: "C"},
                {grade: "C-"},
                {grade: "D+"},
                {grade: "D"},
                {grade: "D-"},
                {grade: "E"}
            ];
            var gradeData = [];
            var totalStudentCount = 0;
            var combinedScore = 0;
            var combinedPoints = 0;
            for(var y = 0; y < availableGrades.length; y++){
                var currentGrade = availableGrades[y].grade;
                var count = 0;
                for(var s = 0; s < resultArray.length; s++){
                    if (resultArray[s].subjectGrade == currentGrade){
                        combinedScore = combinedScore + resultArray[s].subjectScore;
                        combinedPoints = combinedPoints + resultArray[s].subjectPoints;
                        count++;
                        totalStudentCount++;
                    }
                }
                gradeData.push({
                    grade: currentGrade,
                    count: count
                });
            }

            var overallScore = combinedScore / totalStudentCount;
            var overallPoints = combinedPoints / totalStudentCount;
            var overallGrade = "";
            if (overallScore >= 80 && overallScore <= 100){
                overallGrade = "A";
            } else if (overallScore >= 75 && overallScore <= 79.99){
                overallGrade = "A-";
            } else if (overallScore >= 70 && overallScore <= 74.99){
                overallGrade = "B+";
            } else if (overallScore >= 65 && overallScore <= 69.99){
                overallGrade = "B";
            } else if (overallScore >= 60 && overallScore <= 64.99){
                overallGrade = "B-";
            } else if (overallScore >= 55 && overallScore <= 59.99){
                overallGrade = "C+";
            } else if (overallScore >= 50 && overallScore <= 54.99){
                overallGrade = "C";
            } else if (overallScore >= 45 && overallScore <= 49.99){
                overallGrade = "C-";
            } else if (overallScore >= 40 && overallScore <= 44.99){
                overallGrade = "D+";
            } else if (overallScore >= 35 && overallScore <= 39.99){
                overallGrade = "D";
            } else if (overallScore >= 30 && overallScore <= 34.99){
                overallGrade = "D-";
            } else if (overallScore >= 0.1 && overallScore <= 29.99){
                overallGrade = "E";
            }
            //=================================================================

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: classForm,
                classStreamName: classStreamName,
                subjectName: subjectName,
                result: resultArray,
                availableGrades: availableGrades,
                gradeData: gradeData,
                totalStudents:totalStudentCount,
                overallScore: overallScore.toFixed(1),
                overallPoints: overallPoints.toFixed(1),
                overallGrade: overallGrade
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "subject_class_report",
                data: data
            });
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "height": "2480px",
                    "width": "3508px",
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
