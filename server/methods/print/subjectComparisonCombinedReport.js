Meteor.methods({
    'subjectComparisonCombinedExamReport': function(classId, examId, form) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "subject-comparison-combined-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('template', Assets.getText('subject-comparison-combined-report.html'));
            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var classForm = form;

            var subjects = [];
            var activeSubjects = Subjects.find({active: true}).map(function(subject){
                return subject._id;
            });
            var studentArray = Students.find({class: {$in: classId}}).map(function(student){
                return student._id;
            });

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

            for(var s = 0; s < activeSubjects.length; s++){
                var currentSubjectId = activeSubjects[s];
                var subjectName = Subjects.findOne({_id: currentSubjectId}).name;
                var subjectNumber = Subjects.findOne({_id: currentSubjectId}).subjectCode;
                var totalDump = 0;
                var pointsDump = 0;
                var countDump = 0;
                var gradeData = [];
                for(var g = 0; g < availableGrades.length; g++){
                    var currentGrade = availableGrades[g].grade;
                    var count = 0;
                    var subjectArray = Results.find({exam: examId, student: {$in: studentArray}}).map(function(result){
                        var array = result.subjects;
                        for(var i = 0; i < array.length; i++){
                            if(array[i].subject == currentSubjectId){
                                if (array[i].grade == currentGrade){
                                    totalDump = totalDump + array[i].score;
                                    pointsDump = pointsDump + array[i].points;
                                    countDump++;
                                    count++;
                                }
                            }
                        }
                    });
                    gradeData.push({
                        count: count
                    });
                }
                var overallScore = totalDump / countDump;
                var overallPoints = ((overallScore / 100) * 12).toFixed(1)
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
                subjects.push({
                    subjectName: subjectName,
                    subjectNumber: subjectNumber,
                    studentCount: countDump,
                    score: overallScore.toFixed(1),
                    grade: overallGrade,
                    points: overallPoints,
                    gradeData: gradeData
                });
            }

            //=================================================================

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: classForm,
                availableGrade: availableGrades,
                subject: subjects
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "template",
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
