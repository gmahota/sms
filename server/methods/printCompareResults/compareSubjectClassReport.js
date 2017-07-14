Meteor.methods({
    'compareSubjectClassReport': function(yearId, termName, form, stream, subjectId) {
        if (Meteor.isServer) {
            var webshot = Meteor.npmRequire('webshot');
            var fs      = Npm.require('fs');
            var Future = Npm.require('fibers/future');
            var fut = new Future();
            var fileName = "compare-subject-class-report.pdf";
            var css = Assets.getText('merged-stylesheets.css');
            SSR.compileTemplate('layout', Assets.getText('layout.html'));
            Template.layout.helpers({
              getDocType: function() {
                return "<!DOCTYPE html>";
              }
            });
            SSR.compileTemplate('template', Assets.getText('compare-subject-class-report.html'));
            //========================================
            var classId = Classes.findOne({Form: (form * 1), streamName: stream})._id;
            var schoolId = Meteor.user().profile.schoolId;
            var availableExamType = [];
            var examTypeArray = Schools.findOne({_id: schoolId}).examType.map(function(examType){
                var name = examType.name;
                availableExamType.push({
                    examType: name
                });
            });

            var subjectName = Subjects.findOne({_id: subjectId}).name;

            var examIdArray = Exams.find({term: termName, year: (yearId * 1)}).map(function(exam){
                return exam._id;
            });
            var studentIdArray = Students.find({class: classId}).map(function(student){
                return student._id;
            });

            var examCount = 0;
            var resultsObjs = Results.find({exam: {$in: examIdArray}, student: {$in: studentIdArray}}).map(function(res){
                return res.exam;
            });
            for (var w = 0; w < examIdArray.length; w++){
                var current = examIdArray[w];
                var miniExamCount = 0;
                for (var b = 0; b < resultsObjs.length; b++){
                    if (resultsObjs[b] == current){
                        miniExamCount++;
                    }
                }
                if (miniExamCount > 0){
                    examCount++;
                }
            }


            var resultData = [];
            var resultsDataSource = Results.find({exam: {$in: examIdArray}, student: {$in: studentIdArray}}).map(function(result){
                    var studentId = result.student;
                var firstName = Students.findOne({_id: studentId}).firstName;
                var lastName = Students.findOne({_id: studentId}).surname;
                    var classIdOne = Students.findOne({_id: studentId}).class;
                var className = Classes.findOne({_id: classIdOne}).streamName;
                var registrationNumber = Students.findOne({_id: studentId}).registrationNumber;

                function findSubject(subject){
                    return subject.subject == subjectId;
                }
                var subjectResultsData = result.subjects.find(findSubject);
                var examType = Exams.findOne({_id: result.exam}).type;
                resultData.push({
                    studentLastName: lastName,
                    studentFirstName: firstName,
                    className: className,
                    registrationNumber: registrationNumber,
                    examData: {
                        score: subjectResultsData.score,
                        points: subjectResultsData.points,
                        grade: subjectResultsData.grade,
                        examType: examType
                    }
                });
            });

            var studentData = [];
            resultData.forEach(function (a) {
                if (!this[a.registrationNumber]) {
                    this[a.registrationNumber] = { exams: [], registrationNumber: a.registrationNumber, studentLastName: a.studentLastName, studentFirstName: a.studentFirstName , className: a.className};
                    studentData.push(this[a.registrationNumber]);
                }
                var exams = a.examData;
                this[a.registrationNumber].exams.push(exams);
            }, Object.create(null));



            var students = [];
            studentData.map(function(data){
                var examData = [];
                var addedScore = 0;
                var addedPoints = 0;
                for (var e = 0; e < availableExamType.length; e++){
                    var currentExamType = availableExamType[e].examType;
                    var exists = false;
                    var score = 0;
                    var points = 0;
                    var grade = "";
                    for (var r = 0; r < data.exams.length; r++){
                        if (data.exams[r].examType == currentExamType){
                            exists = true;
                            score = data.exams[r].score;
                            points = data.exams[r].points;
                            grade = data.exams[r].grade;
                            addedScore = addedScore + data.exams[r].score;
                            addedPoints = addedPoints + data.exams[r].points;
                        }
                    }
                    examData.push({
                        examType: currentExamType,
                        score: score,
                        points: (points.toFixed(1)) * 1,
                        grade: grade,
                        exists: exists
                    });
                }

                var averageScore = addedScore / examCount;
                var averagePoints = addedPoints / examCount;
                var averageGrade = "";
                if (averageScore >= 80 && averageScore <= 100){
                    averageGrade = "A";
                } else if (averageScore >= 75 && averageScore <= 79.99){
                    averageGrade = "A-";
                } else if (averageScore >= 70 && averageScore <= 74.99){
                    averageGrade = "B+";
                } else if (averageScore >= 65 && averageScore <= 69.99){
                    averageGrade = "B";
                } else if (averageScore >= 60 && averageScore <= 64.99){
                    averageGrade = "B-";
                } else if (averageScore >= 55 && averageScore <= 59.99){
                    averageGrade = "C+";
                } else if (averageScore >= 50 && averageScore <= 54.99){
                    averageGrade = "C";
                } else if (averageScore >= 45 && averageScore <= 49.99){
                    averageGrade = "C-";
                } else if (averageScore >= 40 && averageScore <= 44.99){
                    averageGrade = "D+";
                } else if (averageScore >= 35 && averageScore <= 39.99){
                    averageGrade = "D";
                } else if (averageScore >= 30 && averageScore <= 34.99){
                    averageGrade = "D-";
                } else if (averageScore >= 0.1 && averageScore <= 29.99){
                    averageGrade = "E";
                }

                students.push({
                    exams: examData,
                    registrationNumber: data.registrationNumber,
                    studentLastName: data.studentLastName,
                    studentFirstName: data.studentFirstName,
                    stream: data.className,
                    averageScore: averageScore.toFixed(1),
                    averagePoints: averagePoints.toFixed(1),
                    averageGrade: averageGrade
                });
            });
            students.sort(function(a, b) {
                return parseFloat(b.averageScore) - parseFloat(a.averageScore);
            });

            var studentFinalData = [];
            students.map(function(stud){
                var position = students.findIndex(x => x.registrationNumber == stud.registrationNumber);
                studentFinalData.push({
                    position: (position + 1),
                    exams: stud.exams,
                    registrationNumber: stud.registrationNumber,
                    studentLastName: stud.studentLastName,
                    studentFirstName: stud.studentFirstName,
                    stream: stud.stream,
                    averageScore: stud.averageScore,
                    averagePoints: stud.averagePoints,
                    averageGrade: stud.averageGrade
                });
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
            var analysisInitialData = [];
            for(var e = 0; e < availableExamType.length; e++){
                var currentExamType = availableExamType[e].examType;
                var gradeData = [];
                var dataExists = false;
                var totalStudentCount = 0;
                var combinedPoints = 0;
                var combinedScore = 0;
                for(var y = 0; y < availableGrades.length; y++){
                    var currentGrade = availableGrades[y].grade;
                    var count = 0;
                    for(var s = 0; s < studentFinalData.length; s++){
                        var examsDataArray = studentFinalData[s].exams;
                        for(var d = 0; d < examsDataArray.length; d++){
                            if (examsDataArray[d].examType == currentExamType){
                                if (examsDataArray[d].grade == currentGrade){
                                    combinedPoints = combinedPoints + examsDataArray[d].points;
                                    combinedScore = combinedScore + examsDataArray[d].score;
                                    count++;
                                    totalStudentCount++;
                                }
                            }
                        }
                    }
                    gradeData.push({
                        grade: currentGrade,
                        count: count
                    });
                }
                if (totalStudentCount > 0) {
                    dataExists = true;
                }
                var overallPoints = combinedPoints / totalStudentCount;
                var overallScore = combinedScore / totalStudentCount;
                var overallGrade = "";
                if (overallPoints >= 80 && overallPoints <= 100){
                    overallGrade = "A";
                } else if (overallPoints >= 75 && overallPoints <= 79.99){
                    overallGrade = "A-";
                } else if (overallPoints >= 70 && overallPoints <= 74.99){
                    overallGrade = "B+";
                } else if (overallPoints >= 65 && overallPoints <= 69.99){
                    overallGrade = "B";
                } else if (overallPoints >= 60 && overallPoints <= 64.99){
                    overallGrade = "B-";
                } else if (overallPoints >= 55 && overallPoints <= 59.99){
                    overallGrade = "C+";
                } else if (overallPoints >= 50 && overallPoints <= 54.99){
                    overallGrade = "C";
                } else if (overallPoints >= 45 && overallPoints <= 49.99){
                    overallGrade = "C-";
                } else if (overallPoints >= 40 && overallPoints <= 44.99){
                    overallGrade = "D+";
                } else if (overallPoints >= 35 && overallPoints <= 39.99){
                    overallGrade = "D";
                } else if (overallPoints >= 30 && overallPoints <= 34.99){
                    overallGrade = "D-";
                } else if (overallPoints >= 0.1 && overallPoints <= 29.99){
                    overallGrade = "E";
                }
                analysisInitialData.push({
                    examName: currentExamType,
                    gradeData: gradeData,
                    dataExists: dataExists,
                    totalStudents: totalStudentCount,
                    overallPoints: overallPoints.toFixed(1),
                    overallScore: overallScore.toFixed(1),
                    overallGrade: overallGrade
                });
            }

            //========================================
            var data = {
                year: yearId,
                term: termName,
                subject: subjectName,
                classForm: form,
                classStream: stream,
                availableExamType: availableExamType,
                student: studentFinalData,
                availableGrades: availableGrades,
                examResults: analysisInitialData
            }
            var html_string = SSR.render('layout', {
              css: css,
              template: "template",
              data: data
            });
            console.log("everything looks okay");
            var options = {
                "paperSize": {
                    "height": "2480px",
                    "width": "3508px",
                    "margin": "150px"
                },
                "phantomPath": "/usr/local/bin/phantomjs",
                siteType: 'html'
            };
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
