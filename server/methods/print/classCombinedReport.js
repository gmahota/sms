Meteor.methods({
    'combinedResultsPdf': function(classId, examId, form) {
        if (Meteor.isServer) {
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "combined-report.pdf";

          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('combined_report', Assets.getText('combined-report.html'));

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
                                grade = dsub.grade
                            }
                        }
                    });

                    subjectData.push({
                        graded: graded,
                        subjectScore: score,
                        subjectGrade: grade
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
                    studentFirstName: studentFirstNameLong,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectData: subjectData,
                    overallScore: overallScore,
                    overallGrade: overallGrade,
                    meanGrade: meanGrade,
                    points: ((meanGrade * 12) / 100).toFixed(1),
                    position: position,
                    streamName: streamName,
                    streamNameLong: streamNameLong
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
                var resultStream = result.streamNameLong;
                var resultGrade = result.overallGrade;
                var resultScore = result.overallScore;
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
                this[a.resultStream].resultGrade.push(grade);
                this[a.resultStream].resultScore.push(a.resultScore);
            }, Object.create(null));

            var gradeAnalysis = [];
            gradeAnalysisData.map(function(data){
                var stream = data.resultStream;
                var gradeArray = data.resultGrade;
                var scoreArray = data.resultScore;
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
                var scoreSum = 0;
                for (var o = 0; o < scoreArray.length; o++){
                    var currentScore = scoreArray[o];
                    scoreSum = scoreSum + currentScore;
                }
                var meanMarks = scoreSum / scoreArray.length;
                var meanScore = meanMarks / subject.length;

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
                    meanMarks: meanMarks.toFixed(1),
                    meanScore: meanScore.toFixed(1),
                    meanGrade: meanGrade
                })
            });

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: form,
                subject: subject,
                result: resultArray,
                allGrades: availableGrades,
                streamScore: gradeAnalysis
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
