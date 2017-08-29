Meteor.methods({
    'compareSubjectCombinedExamReport': function(yearId, termName, form, subjectId) {
        if (Meteor.isServer) {
            var webshot = Meteor.npmRequire('webshot');
            var fs      = Npm.require('fs');
            var Future = Npm.require('fibers/future');
            var fut = new Future();
            var fileName = "compare-subject-combined-exam-report.pdf";
            var css = Assets.getText('merged-stylesheets.css');
            SSR.compileTemplate('layout', Assets.getText('layout.html'));
            Template.layout.helpers({
              getDocType: function() {
                return "<!DOCTYPE html>";
              }
            });
            SSR.compileTemplate('template', Assets.getText('compare-subject-combined-exam-report.html'));
            //========================================
            var classIdArray = Classes.find({Form: (form * 1)}).map(function(classData){
                return classData._id;
            });
            var schoolId = Meteor.user().profile.schoolId;
            var availableExamType = [];
            var examTypeArray = Schools.findOne({_id: schoolId}).examType.map(function(examType){
                var name = examType.name;
                availableExamType.push({
                    examType: name
                });
            })

            var subjectName = Subjects.findOne({_id: subjectId}).name;

            var examIdArray = Exams.find({term: termName, year: (yearId * 1)}).map(function(exam){
                return exam._id;
            });
            var studentIdArray = Students.find({class: {$in: classIdArray}, active: true}).map(function(student){
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
                console.log("exam count", miniExamCount);
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
                var integerPoints = averagePoints.toFixed(1);
                if (integerPoints >= 11.5 && integerPoints <= 12){
                    averageGrade = "A";
                } else if (integerPoints >= 10.5 && integerPoints <= 11){
                    averageGrade = "A-";
                } else if (integerPoints >= 9.5 && integerPoints <= 10){
                    averageGrade = "B+";
                } else if (integerPoints >= 8.5 && integerPoints <= 9){
                    averageGrade = "B";
                } else if (integerPoints >= 7.5 && integerPoints <= 8){
                    averageGrade = "B-";
                } else if (integerPoints >= 6.5 && integerPoints <= 7){
                    averageGrade = "C+";
                } else if (integerPoints >= 5.5 && integerPoints <= 6){
                    averageGrade = "C";
                } else if (integerPoints >= 4.5 && integerPoints <= 5){
                    averageGrade = "C-";
                } else if (integerPoints >= 3.5 && integerPoints <= 4){
                    averageGrade = "D+";
                } else if (integerPoints >= 2.5 && integerPoints <= 3){
                    averageGrade = "D";
                } else if (integerPoints >= 1.5 && integerPoints <= 2){
                    averageGrade = "D-";
                } else if (integerPoints >= 0 && integerPoints <= 1){
                    averageGrade = "E";
                }

                students.push({
                    exams: examData,
                    registrationNumber: data.registrationNumber,
                    studentLastName: data.studentLastName,
                    studentFirstName: data.studentFirstName,
                    stream: data.className,
                    averageScore: averageScore.toFixed(1),
                    averagePoints: averagePoints.toFixed(3),
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
            var classAnalysis = [];
            var classNameArray = Classes.find({Form: (form * 1)}).map(function(classData){
                return classData.streamName;
            });
            for (var c = 0; c < classNameArray.length; c++){
                var currentClass = classNameArray[c];
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
                    var combinedPoints = 0;
                    var combinedScore = 0;
                    var totalStudentCount = 0;
                    for(var y = 0; y < availableGrades.length; y++){
                        var currentGrade = availableGrades[y].grade;
                        var count = 0;
                        for(var s = 0; s < studentFinalData.length; s++){
                            if (studentFinalData[s].stream == currentClass){
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
                        }
                        gradeData.push({
                            grade: currentGrade,
                            count: count
                        });
                    }
                    if (totalStudentCount > 0) {
                        dataExists = true;
                    }
                    var overallScore = combinedScore / totalStudentCount;
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
                    analysisInitialData.push({
                        examName: currentExamType,
                        gradeData: gradeData,
                        dataExists: dataExists,
                        totalStudents: totalStudentCount,
                        overallScore: overallScore.toFixed(1),
                        overallPoints: overallPoints,
                        overallGrade: overallGrade
                    });
                }
                classAnalysis.push({
                    form: form,
                    stream: currentClass,
                    availableGrades: availableGrades,
                    examResults: analysisInitialData
                });
            }

            //========================================
            var data = {
                year: yearId,
                term: termName,
                classForm: form,
                availableExamType: availableExamType,
                student: studentFinalData,
                subject: subjectName,
                classAnalysis: classAnalysis
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
