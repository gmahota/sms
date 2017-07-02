Meteor.methods({
    'combinedGenderResultsPdf': function(classId, examId, form, gender) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "gender-combined-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('gender_combined_report', Assets.getText('gender-combined-report.html'));

          // PREPARE DATA

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
                var studentGender = Students.findOne({_id: result.student}).gender;
                var overallScore = result.overallScore;
                var overallGrade = result.overallGrade;
                var meanGrade = parseInt((overallScore / result.subjects.length) * 1);
                var subjectData = [];
                var subjectMainData = Subjects.find().map(function(subj){
                    var subjectId = subj._id;
                    var doneSubjects = result.subjects;
                    console.log('here boogoe', doneSubjects);
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
                    position: position,
                    streamName: streamName,
                    studentGender: studentGender
                });
            });

            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
            });

            var tmp = [];
            /* loop over all array items */
            for(var index in resultArray){
                if(resultArray[index].studentGender == gender){
                    /* push to temporary resultArray if not like item */
                    tmp.push(resultArray[index]);
                }
            }


            var gradeDataArr = [];
            var gradeDataSrc = tmp.forEach(function(result){
                var resultGrade = result.overallGrade;
                var resultGender = result.studentGender;
                gradeDataArr.push({
                    resultGrade: resultGrade,
                    resultGender: resultGender
                });
            });
            var gradeAnalysis = [];
            var copy = gradeDataArr.slice(0);
        	for (var i = 0; i < gradeDataArr.length; i++) {
        		var myCount = 0;
                var myGrade = "";
        		for (var w = 0; w < copy.length; w++) {
        			if (gradeDataArr[i].resultGrade == copy[w].resultGrade) {
                        myGrade = copy[w].resultGrade;
        				myCount++;
        				delete copy[w].resultGrade;
        			}
        		}
        		if (myCount > 0) {
        			var a = new Object();
        			a.grade = myGrade;
        			a.total = myCount;
        			gradeAnalysis.push(a);
        		}
        	}
            gradeDataArr.sort(function(a, b) {
                return parseFloat(a.grade) - parseFloat(b.grade);
            });

            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: form,
                subject: subject,
                result: tmp,
                gender: gender,
                gradeAnalysis: gradeAnalysis,
                totalStudents: tmp.length
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "gender_combined_report",
                data: data
            });

            //console.log(html_string);
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
