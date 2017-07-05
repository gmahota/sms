Meteor.methods({
    'subjectClassReport': function(classId, examId, subjectId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "subject-class-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('subject_class_report', Assets.getText('subject-class-report.html'));
            var examtype = Exams.findOne({_id: examId}).type;
            var examterm = Exams.findOne({_id: examId}).term;
            var examyear = Exams.findOne({_id: examId}).year;

            var classForm = Classes.findOne({_id: classId}).Form;
            var classStreamName = Classes.findOne({_id: classId}).streamName;

            var subjectName = Subjects.findOne({_id: subjectId}).name;

            var resultDataArray = [];
            var studentIdArray = Students.find({class: classId}).map(function(student){
                return student._id;
            });
            var resultData = Results.find({exam: examId, student: {$in : studentIdArray}}).map(function(result){
                var resultId = result._id;
                var studentFirstNameLong = Students.findOne({_id: result.student}).firstName;
                var studentLastName = Students.findOne({_id: result.student}).surname;
                var studentFirstName = studentFirstNameLong.substring(0, 1);
                var studentRegistrationNumber = Students.findOne({_id: result.student}).registrationNumber;
                var studentGender = Students.findOne({_id: result.student}).gender;

                var subjectScore = 0;
                var subjectPoints = 0;
                var subjectGrade = "-";
                var graded = false;
                var subjectDataCalc = result.subjects.map(function(subj){
                    if(subj.subject == subjectId){
                        graded = true;
                        subjectScore = subj.score;
                        subjectGrade = subj.grade;
                        subjectPoints = subj.points;
                    }
                });
                resultDataArray.push({
                    resultId: resultId,
                    studentGender: studentGender,
                    studentFirstName: studentFirstNameLong,
                    studentLastName: studentLastName,
                    studentRegistrationNumber: studentRegistrationNumber,
                    subjectScore: subjectScore,
                    subjectPoints: subjectPoints,
                    subjectGrade: subjectGrade,
                    graded: graded
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

            var classMeanScore = resultArray.map(function(item){
                return item.subjectScore;
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

            var gradeDataArr = [];
            var gradeDataSrc = resultArray.forEach(function(result){
                var resultGrade = result.subjectGrade;
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
                subjectName: subjectName,
                result: resultArray,
                gradeAnalysis: gradeAnalysis,
                totalStudents: resultArray.length,
                classMeanScore: parseInt(classMeanScore),
                classMeanGrade: classMeanGrade,
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "subject_class_report",
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
