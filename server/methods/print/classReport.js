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
                    studentGender: studentGender,
                    position: position
                });
            });

            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
            });

            var classMeanScore = resultArray.map(function(item){
                return item.meanGrade;
            }).reduce(function(a, b){
                return a + b;
            }, 0) / resultArray.length;

            var classMeanGrade = function(){
                if (classMeanScore >= 80 && classMeanScore <= 100){
                     return "A";
                } else if (classMeanScore >= 75 && classMeanScore <= 79.99){
                     return "A-";
                } else if (classMeanScore >= 70 && classMeanScore <= 74.99){
                     return "B+";
                } else if (classMeanScore >= 65 && classMeanScore <= 69.99){
                     return "B";
                } else if (classMeanScore >= 60 && classMeanScore <= 64.99){
                     return "B-";
                } else if (classMeanScore >= 55 && classMeanScore <= 59.99){
                     return "C+";
                } else if (classMeanScore >= 50 && classMeanScore <= 54.99){
                     return "C";
                } else if (classMeanScore >= 45 && classMeanScore <= 49.99){
                     return "C-";
                } else if (classMeanScore >= 40 && classMeanScore <= 44.99){
                     return "D+";
                } else if (classMeanScore >= 35 && classMeanScore <= 39.99){
                     return "D";
                } else if (classMeanScore >= 30 && classMeanScore <= 34.99){
                     return "D-";
                } else if (classMeanScore >= 0.1 && classMeanScore <= 29.99){
                     return "E";
                }
            };

            var classMeanMark = resultArray.map(function(item){
                return item.overallScore;
            }).reduce(function(a, b){
                return a + b;
            }, 0) / resultArray.length;


            var gradeDataArr = [];
            var gradeDataSrc = resultArray.forEach(function(result){
                var resultGrade = result.overallGrade;
                var resultGender = result.studentGender;
                gradeDataArr.push({
                    resultGrade: resultGrade,
                    resultGender: resultGender
                });
            });


            var gradeAnalysisData = [];

            gradeDataArr.sort(function(a, b) {
                return parseFloat(a.grade) - parseFloat(b.grade);
            });

            gradeDataArr.forEach(function (a) {
                if (!this[a.resultGrade]) {
                    this[a.resultGrade] = { resultGender: [], resultGrade: a.resultGrade };
                    gradeAnalysisData.push(this[a.resultGrade]);
                }
                this[a.resultGrade].resultGender.push(a.resultGender);
            }, Object.create(null));

            console.log(gradeAnalysisData);

            var gradeAnalysis = [];
            gradeAnalysisData.map(function(data){
                var grade = data.resultGrade;
                var total = data.resultGender.length;
                gradeAnalysis.push({
                    grade: grade,
                    total: total
                });
            });

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: classForm,
                classStreamName: classStreamName,
                subject: subject,
                result: resultArray,
                gradeAnalysis: gradeAnalysis,
                totalStudents: resultArray.length,
                classMeanScore: parseInt(classMeanScore),
                classMeanGrade: classMeanGrade,
                classMeanMark: parseInt(classMeanMark)
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_report",
                data: data
            });

            console.log(html_string);
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "format": "A4",
                    "orientation": "landscape",
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
