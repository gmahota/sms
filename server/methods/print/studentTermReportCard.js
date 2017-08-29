
Meteor.methods({
    'termReport': function(id, termName, year) {
        if (Meteor.isServer) {
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "student-term-report.pdf";
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layoutPortrait.html'));

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
                            points: subj.points,
                            selected: subj.selected
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
                    return {
                        score:scor.score,
                        points:scor.points
                    }
                });
                var averageScore = parseInt((scoreArr.score.reduce((x, y) => x + y))/availableExams.length);
                var points = ((scoreArr.points.reduce((x, y) => x + y))/availableExams.length).toFixed(1);
                var comments = "";
                var grade = "";
                if (item.exam.length < availableExams.length){
                    item.exam.push({
                        examName: "check for this in future",
                        grade: "-",
                        score: "0",
                        points: "0"
                    });
                }
                var integerPoints = parseInt(points);
                if (integerPoints == 12){
                    grade = "A";
                    comments = "EXCELLENT";
                } else if (integerPoints == 11){
                    grade = "A-";
                    comments = "EXCELLENT";
                } else if (integerPoints == 10){
                    grade = "B+";
                    comments = "V-GOOD";
                } else if (integerPoints == 9){
                    grade = "B";
                    comments = "GOOD";
                } else if (integerPoints == 8){
                    grade = "B-";
                    comments = "GOOD";
                } else if (integerPoints == 7){
                    grade = "C+";
                    comments = "FAIR";
                } else if (integerPoints == 6){
                    grade = "C";
                    comments = "FAIR";
                } else if (integerPoints == 5){
                    grade = "C-";
                    comments = "FAIR";
                } else if (integerPoints == 4){
                    grade = "D+";
                    comments = "TRIAL";
                } else if (integerPoints == 3){
                    grade = "D";
                    comments = "TRIAL";
                } else if (integerPoints == 2){
                    grade = "D-";
                    comments = "POOR";
                } else if (integerPoints == 1){
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

            //=============POSITION CALCULATION==========================
            var posExamArray = Exams.find({term: termName, year: year, active: true}).map(function(exam){
                return exam._id;
            });
            var posClassStudents = Students.find({class: classId}).map(function(cla){
                return cla._id;
            });
            var posResultsArray = Results.find({exam: {$in: posExamArray}, student: {$in: posClassStudents}});
            var posResultBreakdown = [];
            for(var c = 0; c < posClassStudents.length; c++){
                var currentStudentId = posClassStudents[c];
                var totalMarksData = 0;
                var examsCountData = 0;
                for(var r = 0; r < posResultsArray.length; r++){
                    if(posResultsArray[r].student == currentStudentId){
                        totalMarksData = totalMarksData + posResultsArray[r].overallScore;
                        examsCountData++;
                    }
                }
                posResultBreakdown.push({
                    studentId: currentStudentId,
                    score: totalMarksData / posExamArray.length
                });
            }
            posResultBreakdown.sort(function(a, b) {
                return parseFloat(b.score) - parseFloat(a.score);
            });
            var position = posResultBreakdown.findIndex(x => x.studentId == id);


            //=============STREAM POSITION CALCULATION==========================
            var streamClassArray = Classes.find({Form: (studentClassForm * 1)}).map(function(clas){
                return clas._id;
            });
            var streamPosClassStudents = Students.find({class: {$in: streamClassArray}}).map(function(cla){
                return cla._id;
            });
            var streamPosResultsArray = Results.find({exam: {$in: posExamArray}, student: {$in: streamPosClassStudents}});
            var streamPosResultBreakdown = [];
            for(var c = 0; c < streamPosClassStudents.length; c++){
                var currentStudentId = streamPosClassStudents[c];
                var totalMarksData = 0;
                var examsCountData = 0;
                for(var r = 0; r < streamPosResultsArray.length; r++){
                    if(streamPosResultsArray[r].student == currentStudentId){
                        totalMarksData = totalMarksData + streamPosResultsArray[r].overallScore;
                        examsCountData++;
                    }
                }
                streamPosResultBreakdown.push({
                    studentId: currentStudentId,
                    score: totalMarksData / posExamArray.length
                });
            }
            streamPosResultBreakdown.sort(function(a, b) {
                return parseFloat(b.score) - parseFloat(a.score);
            });
            var streamPosition = streamPosResultBreakdown.findIndex(x => x.studentId == id);

            //=================================================================
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
                kcpe: kcpe,
                position: position,
                classNumber: posResultBreakdown.length,
                streamPosition: streamPosition,
                streamNumber: streamPosResultBreakdown.length
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "student_term_report",
                data: data
            });

            console.log("all is good");
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
