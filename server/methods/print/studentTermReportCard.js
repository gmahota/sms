
Meteor.methods({
    'termReport': function(id, termName, year) {
        if (Meteor.isServer) {
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "student-term-report.pdf";
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('student_term_report', Assets.getText('student-term-report.html'));

            var term = termName;
            var yearSelection = year;
            var studentFirstName = Students.findOne({_id: id}).firstName;
            var studentLastName = Students.findOne({_id: id}).surname;
            var studentRegistrationNumber = Students.findOne({_id: id}).registrationNumber;
            var studentYear = Students.findOne({_id: id}).yearOfAdmission;
            var kcpe = Students.findOne({_id: id}).kcpeResults;

            var classId = Students.findOne({_id: id}).class;
            var studentClassForm = Classes.findOne({_id: classId}).Form;
            var studentClassStreamName = Classes.findOne({_id: classId}).streamName;

            var examsInTermIdArr = Exams.find({term: termName, year: (yearSelection * 1)}).map(function(exam){
                return exam._id;
            });
            var initResultDataArray = [];
            var resultsArray = Results.find({student: id, exam: {$in: examsInTermIdArr}}).map(function(result){
                var examId = result.exam;
                var examName = Exams.findOne({_id: examId}).type;
                var subjectData = result.subjects.map(function(subj){
                    var subjectId = subj.subject;
                    var subjectName = Subjects.findOne({_id: subjectId}).name;

                    initResultDataArray.push({
                        subjectName: subjectName,
                        examName: examName,
                        exam: {
                            examName: examName,
                            grade: subj.grade,
                            score: subj.score,
                            points: subj.points
                        }
                    });
                });

            })

            var resultsCopy = initResultDataArray.slice(0);

            var groupedSubjectData = [];
            resultsCopy.forEach(function (a) {
                if (!this[a.subjectName]) {
                    this[a.subjectName] = { exam: [], subjectName: a.subjectName };
                    groupedSubjectData.push(this[a.subjectName]);
                }
                this[a.subjectName].exam.push(a.exam);
            }, Object.create(null));

            var availableExams = [];
            resultsCopy.forEach(function (a) {
                if (!this[a.examName]) {
                    this[a.examName] = { exam: [], examName: a.examName };
                    availableExams.push(this[a.examName]);
                }
                this[a.examName].exam.push(a.exam);
            }, Object.create(null));

            var finalGroupedSubjectData = [];
            groupedSubjectData.forEach(function(item){
                var scoreArr = item.exam.map(function(scor){
                    return scor.score;
                });
                var averageScore = parseInt((scoreArr.reduce((x, y) => x + y))/availableExams.length);
                var points = (12 * averageScore)/100;
                var comments = "";
                var grade = "";
                if (item.exam.length < availableExams.length){
                    item.exam.push({
                        examName: "check for this infuture",
                        grade: "-",
                        score: "0",
                        points: "0"
                    });
                }

                if (averageScore >= 80 && averageScore <= 100){
                    grade = "A";
                    comments = "EXCELLENT";
                } else if (averageScore >= 75 && averageScore <= 79.99){
                    grade = "A-";
                    comments = "EXCELLENT";
                } else if (averageScore >= 70 && averageScore <= 74.99){
                    grade = "B+";
                    comments = "V-GOOD";
                } else if (averageScore >= 65 && averageScore <= 69.99){
                    grade = "B";
                    comments = "GOOD";
                } else if (averageScore >= 60 && averageScore <= 64.99){
                    grade = "B-";
                    comments = "GOOD";
                } else if (averageScore >= 55 && averageScore <= 59.99){
                    grade = "C+";
                    comments = "FAIR";
                } else if (averageScore >= 50 && averageScore <= 54.99){
                    grade = "C";
                    comments = "FAIR";
                } else if (averageScore >= 45 && averageScore <= 49.99){
                    grade = "C-";
                    comments = "FAIR";
                } else if (averageScore >= 40 && averageScore <= 44.99){
                    grade = "D+";
                    comments = "TRIAL";
                } else if (averageScore >= 35 && averageScore <= 39.99){
                    grade = "D";
                    comments = "TRIAL";
                } else if (averageScore >= 30 && averageScore <= 34.99){
                    grade = "D-";
                    comments = "POOR";
                } else if (averageScore >= 0.1 && averageScore <= 29.99){
                    grade = "E";
                    comments = "V-POOR";
                }

                finalGroupedSubjectData.push({
                    subjectName: item.subjectName,
                    examName: item.examName,
                    exam: item.exam,
                    averageScore: averageScore,
                    averageGrade: grade,
                    averagePoints: points,
                    comments: comments
                });

            });

            var overallScoreArr = finalGroupedSubjectData.map(function(item){
                return item.averageScore;
            });
            var overallScore = parseInt(overallScoreArr.reduce((x, y) => x + y));

            var overallAverage = parseInt(overallScore / finalGroupedSubjectData.length);

            var overallGrade = "";
            if (overallAverage >= 80 && overallAverage <= 100){
                overallGrade = "A";
            } else if (overallAverage >= 75 && overallAverage <= 79.99){
                overallGrade = "A-";
            } else if (overallAverage >= 70 && overallAverage <= 74.99){
                overallGrade = "B+";
            } else if (overallAverage >= 65 && overallAverage <= 69.99){
                overallGrade = "B";
            } else if (overallAverage >= 60 && overallAverage <= 64.99){
                overallGrade = "B-";
            } else if (overallAverage >= 55 && overallAverage <= 59.99){
                overallGrade = "C+";
            } else if (overallAverage >= 50 && overallAverage <= 54.99){
                overallGrade = "C";
            } else if (overallAverage >= 45 && overallAverage <= 49.99){
                overallGrade = "C-";
            } else if (overallAverage >= 40 && overallAverage <= 44.99){
                overallGrade = "D+";
            } else if (overallAverage >= 35 && overallAverage <= 39.99){
                overallGrade = "D";
            } else if (overallAverage >= 30 && overallAverage <= 34.99){
                overallGrade = "D-";
            } else if (overallAverage >= 0.1 && overallAverage <= 29.99){
                overallGrade = "E";
            }

            var data = {
                term: term,
                year: yearSelection,
                studentFirstName: studentFirstName,
                studentLastName: studentLastName,
                studentRegistrationNumber: studentRegistrationNumber,
                studentYear: studentYear,
                studentClassForm: studentClassForm,
                studentClassStreamName: studentClassStreamName,
                availableExam: availableExams,
                subjects:finalGroupedSubjectData,
                overallScore: overallScore,
                overallGrade: overallGrade,
                averageScore: overallAverage,
                kcpe: kcpe
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "student_term_report",
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
