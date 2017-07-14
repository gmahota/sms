Meteor.methods({
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
                var studentGender = Students.findOne({_id: result.student}).gender;
                var overallScore = result.overallScore;
                var overallGrade = result.overallGrade;
                var meanGrade = parseInt((overallScore / result.subjects.length) * 1);
                var subjectData = [];
                var subjectMainData = Subjects.find().map(function(subj){
                    var subjectId = subj._id;
                    var doneSubjects = result.subjects;
                    var graded = false;
                    var score = 0;
                    var grade = "";

                    var sense = doneSubjects.map(function(dsub){
                        if (dsub){
                            if (subjectId == dsub.subject){
                                graded = true;
                                score = dsub.score;
                                grade = dsub.grade;
                            }
                        }
                    });

                    subjectData.push({
                        graded: graded,
                        subjectScore: score,
                        subjectGrade: grade
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
                    studentFirstName: studentFirstNameLong,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectData: subjectData,
                    overallScore: overallScore,
                    overallGrade: overallGrade,
                    meanGrade: meanGrade,
                    points: ((meanGrade * 12) / 100).toFixed(1),
                    studentGender: studentGender,
                    position: position
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
            var combinedMarks = 0;
            for(var y = 0; y < availableGrades.length; y++){
                var currentGrade = availableGrades[y].grade;
                var count = 0;
                for(var s = 0; s < resultArray.length; s++){
                    if (resultArray[s].overallGrade == currentGrade){
                        combinedScore = combinedScore + resultArray[s].meanGrade;
                        combinedMarks = combinedMarks + resultArray[s].overallScore;
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
            var overallMarks = combinedMarks / totalStudentCount;
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

            //===================================================

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: classForm,
                classStreamName: classStreamName,
                subject: subject,
                result: resultArray,
                availableGrades: availableGrades,
                gradeData: gradeData,
                totalStudents:totalStudentCount,
                overallScore: overallScore,
                overallMarks: overallMarks,
                overallGrade: overallGrade
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_report",
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
