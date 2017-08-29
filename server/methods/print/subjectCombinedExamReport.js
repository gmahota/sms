Meteor.methods({
    'subjectCombinedExamReport': function(classId, examId, form, subjectId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "subject-combined-class-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('subject_combined_class_report', Assets.getText('subject-combined-class-report.html'));
            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var subjectName = Subjects.findOne({_id: subjectId}).name;

            var resultDataArray = [];
            var studentIdArray = Students.find({class: {$in: classId}}).map(function(student){
                return student._id;
            });
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstNameLong = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var studentFirstName = studentFirstNameLong.substring(0, 1);
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                var studentGender = Students.findOne({_id: result.student}).gender;
                var studentClassId = Students.findOne({_id: result.student}).class;
                var stream = Classes.findOne({_id: studentClassId}).streamName;

                var subjectScore = 0;
                var subjectPoints = 0;
                var subjectGrade = "-";
                var graded = false;
                var selected = false;
                var subjectDataCalc = result.subjects.map(function(subj){
                    if(subj.subject == subjectId){
                        graded = true;
                        subjectScore = subj.score;
                        subjectGrade = subj.grade;
                        subjectPoints = subj.points;
                        selected = subj.selected;
                    }
                });
                resultDataArray.push({
                    resultId: resultId,
                    stream: stream,
                    studentGender: studentGender,
                    studentFirstName: studentFirstNameLong,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectScore: subjectScore,
                    subjectPoints: subjectPoints,
                    subjectGrade: subjectGrade,
                    graded: graded,
                    selected: selected
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
                    stream: data.stream,
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

            var gradeDataArr = [];
            var gradeDataSrc = resultArray.forEach(function(result){
                var resultStream = result.stream;
                var resultGrade = result.subjectGrade;
                var resultScore = result.subjectScore;
                gradeDataArr.push({
                    resultStream: resultStream,
                    resultGrade: resultGrade,
                    resultScore: resultScore
                });
            });
            gradeDataArr.sort(function(a, b) {
                return parseFloat(a.resultStream) - parseFloat(b.resultStream);
            });
            var gradeAnalysisData = [];
            gradeDataArr.forEach(function (a) {
                if (!this[a.resultStream]) {
                    this[a.resultStream] = { resultGrade: [], resultScore: [], resultStream: a.resultStream };
                    gradeAnalysisData.push(this[a.resultStream]);
                }
                var grade = a.resultGrade;
                this[a.resultStream].resultScore.push(a.resultScore);
                this[a.resultStream].resultGrade.push(grade);
            }, Object.create(null));

            var gradeAnalysis = [];
            gradeAnalysisData.map(function(data){
                var stream = data.resultStream;
                var gradeArray = data.resultGrade;
                var gradeObj = [];
                for (var g = 0; g < availableGrades.length; g++){
                    var currentGrade = availableGrades[g].grade;
                    var currentCount = 0;
                    for (var b = 0; b < gradeArray.length; b++){
                        if (currentGrade == gradeArray[b]){
                            currentCount++;
                        }
                    }
                    gradeObj.push({
                        grade: currentGrade,
                        total: currentCount
                    });
                }

                var scoreArray = data.resultScore;
                var scoreSum = 0;
                for (var o = 0; o < scoreArray.length; o++){
                    var currentScore = scoreArray[o];
                    scoreSum = scoreSum + currentScore;
                }
                var meanScore = scoreSum / scoreArray.length;

                var meanGrade = function(){
                    if (meanScore >= 80 && meanScore <= 100){
                         return "A";
                    } else if (meanScore >= 75 && meanScore <= 79.99){
                         return "A-";
                    } else if (meanScore >= 70 && meanScore <= 74.99){
                         return "B+";
                    } else if (meanScore >= 65 && meanScore <= 69.99){
                         return "B";
                    } else if (meanScore >= 60 && meanScore <= 64.99){
                         return "B-";
                    } else if (meanScore >= 55 && meanScore <= 59.99){
                         return "C+";
                    } else if (meanScore >= 50 && meanScore <= 54.99){
                         return "C";
                    } else if (meanScore >= 45 && meanScore <= 49.99){
                         return "C-";
                    } else if (meanScore >= 40 && meanScore <= 44.99){
                         return "D+";
                    } else if (meanScore >= 35 && meanScore <= 39.99){
                         return "D";
                    } else if (meanScore >= 30 && meanScore <= 34.99){
                         return "D-";
                    } else if (meanScore >= 0.1 && meanScore <= 29.99){
                         return "E";
                    }
                };

                gradeAnalysis.push({
                    stream: stream,
                    grade: gradeObj,
                    totalStudents: gradeArray.length,
                    meanScore: meanScore.toFixed(1),
                    meanGrade: meanGrade
                })
            });

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                form: form,
                subjectName: subjectName,
                result: resultArray,
                allGrades: availableGrades,
                streamScore: gradeAnalysis
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "subject_combined_class_report",
                data: data
            });

            console.log("everything is fine");
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
