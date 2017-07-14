Meteor.methods({
    'compareSingleClassResult': function(yearId, termName, form, stream) {
        if (Meteor.isServer) {
            var webshot = Meteor.npmRequire('webshot');
            var fs      = Npm.require('fs');
            var Future = Npm.require('fibers/future');
            var fut = new Future();
            var fileName = "compare-single-class-result.pdf";
            var css = Assets.getText('merged-stylesheets.css');
            SSR.compileTemplate('layout', Assets.getText('layout.html'));
            Template.layout.helpers({
              getDocType: function() {
                return "<!DOCTYPE html>";
              }
            });
            SSR.compileTemplate('template', Assets.getText('compare-single-class-result.html'));
            //========================================
            var classId = Classes.findOne({Form: (form * 1), streamName: stream})._id;
            var schoolId = Meteor.user().profile.schoolId;
            var availableExamType = [];
            var examTypeArray = Schools.findOne({_id: schoolId}).examType.map(function(examType){
                var name = examType.name;
                availableExamType.push({
                    examType: name
                });
            })

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
                var marks = result.overallScore;
                var score = marks / result.subjects.length;
                var grade = "";
                if (score >= 80 && score <= 100){
                    grade = "A";
                } else if (score >= 75 && score <= 79.99){
                    grade = "A-";
                } else if (score >= 70 && score <= 74.99){
                    grade = "B+";
                } else if (score >= 65 && score <= 69.99){
                    grade = "B";
                } else if (score >= 60 && score <= 64.99){
                    grade = "B-";
                } else if (score >= 55 && score <= 59.99){
                    grade = "C+";
                } else if (score >= 50 && score <= 54.99){
                    grade = "C";
                } else if (score >= 45 && score <= 49.99){
                    grade = "C-";
                } else if (score >= 40 && score <= 44.99){
                    grade = "D+";
                } else if (score >= 35 && score <= 39.99){
                    grade = "D";
                } else if (score >= 30 && score <= 34.99){
                    grade = "D-";
                } else if (score >= 0.1 && score <= 29.99){
                    grade = "E";
                }
                var examType = Exams.findOne({_id: result.exam}).type;
                resultData.push({
                    studentLastName: lastName,
                    studentFirstName: firstName,
                    className: className,
                    registrationNumber: registrationNumber,
                    examData: {
                        marks: marks,
                        score: score,
                        grade: grade,
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
                var addedMarks = 0;
                for (var e = 0; e < availableExamType.length; e++){
                    var currentExamType = availableExamType[e].examType;
                    var exists = false;
                    var marks = 0;
                    var score = 0;
                    var grade = "";
                    for (var r = 0; r < data.exams.length; r++){
                        if (data.exams[r].examType == currentExamType){
                            exists = true;
                            marks = data.exams[r].marks;
                            score = data.exams[r].score;
                            grade = data.exams[r].grade;
                            addedScore = addedScore + data.exams[r].marks;
                            addedMarks = addedMarks + data.exams[r].score;
                        }
                    }
                    examData.push({
                        examType: currentExamType,
                        marks: marks,
                        score: (score.toFixed(1)) * 1,
                        grade: grade,
                        exists: exists
                    });
                }

                var averageScore = addedScore / examCount;
                var averageMean = addedMarks / examCount;
                var averageGrade = "";
                if (averageMean >= 80 && averageMean <= 100){
                    averageGrade = "A";
                } else if (averageMean >= 75 && averageMean <= 79.99){
                    averageGrade = "A-";
                } else if (averageMean >= 70 && averageMean <= 74.99){
                    averageGrade = "B+";
                } else if (averageMean >= 65 && averageMean <= 69.99){
                    averageGrade = "B";
                } else if (averageMean >= 60 && averageMean <= 64.99){
                    averageGrade = "B-";
                } else if (averageMean >= 55 && averageMean <= 59.99){
                    averageGrade = "C+";
                } else if (averageMean >= 50 && averageMean <= 54.99){
                    averageGrade = "C";
                } else if (averageMean >= 45 && averageMean <= 49.99){
                    averageGrade = "C-";
                } else if (averageMean >= 40 && averageMean <= 44.99){
                    averageGrade = "D+";
                } else if (averageMean >= 35 && averageMean <= 39.99){
                    averageGrade = "D";
                } else if (averageMean >= 30 && averageMean <= 34.99){
                    averageGrade = "D-";
                } else if (averageMean >= 0.1 && averageMean <= 29.99){
                    averageGrade = "E";
                }

                students.push({
                    exams: examData,
                    registrationNumber: data.registrationNumber,
                    studentLastName: data.studentLastName,
                    studentFirstName: data.studentFirstName,
                    stream: data.className,
                    averageScore: averageScore.toFixed(1),
                    averageMean: averageMean.toFixed(1),
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
                    averageMean: stud.averageMean,
                    points: ((stud.averageMean * 12) / 100).toFixed(1),
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
                var combinedScore = 0;
                var combinedMarks = 0;
                for(var y = 0; y < availableGrades.length; y++){
                    var currentGrade = availableGrades[y].grade;
                    var count = 0;
                    for(var s = 0; s < studentFinalData.length; s++){
                        var examsDataArray = studentFinalData[s].exams;
                        for(var d = 0; d < examsDataArray.length; d++){
                            if (examsDataArray[d].examType == currentExamType){
                                if (examsDataArray[d].grade == currentGrade){
                                    combinedScore = combinedScore + examsDataArray[d].score;
                                    combinedMarks = combinedMarks + examsDataArray[d].marks;
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
                analysisInitialData.push({
                    examName: currentExamType,
                    gradeData: gradeData,
                    dataExists: dataExists,
                    totalStudents: totalStudentCount,
                    overallScore: overallScore.toFixed(1),
                    overallMarks: overallMarks.toFixed(1),
                    overallGrade: overallGrade
                });
            }


            //========================================
            var data = {
                year: yearId,
                term: termName,
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
