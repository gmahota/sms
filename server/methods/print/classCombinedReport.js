Meteor.methods({
    'combinedResultsPdf': function(classId, examId, form) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "combined-report.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('combined_report', Assets.getText('combined-report.html'));

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
                    position: position,
                    streamName: streamName
                });
            });
            resultArray.sort(function(a, b) {
                return parseFloat(a.position) - parseFloat(b.position);
            });

            var streamArrDump = resultArray.map(function(data){
                return data.streamName;
            });
            var noDupeObj = {}
            for (i = 0, n = streamArrDump.length; i < n; i++) {
                var item = streamArrDump[i];
                noDupeObj[item] = item;
            }
            var i = 0;
            var streamArray = [];
            for (var item in noDupeObj) {
                streamArray[i++] = noDupeObj[item];
            }

            var classScore = [];
            // var classScore = [
            //     {
            //         class: "east",
            //         availableGrade [
            //             {score: 2, grade: "A"},
            //             {score: 2, grade: "A-"},
            //             {score: 2, grade: "B+"},
            //             {score: 2, grade: "B"},
            //             {score: 2, grade: "B-"},
            //             {score: 2, grade: "C+"},
            //             {score: 2, grade: "C"},
            //             {score: 2, grade: "C-"},
            //             {score: 2, grade: "D+"},
            //             {score: 2, grade: "D"},
            //             {score: 2, grade: "D-"},
            //             {score: 2, grade: "E"}
            //         ],
            //         classMeanScore: 21,
            //         classMeanGrade: D,
            //         classMeanMark: 256,
            //         totalStudents: 12
            //     }
            // ];



            // for (var x = 0; x < streamArray.length; x++) {
            //
            //     var gradeAnalysis = [];
            //     var copy = resultArray.slice(0);
            // 	for (var i = 0; i < resultArray.length; i++) {
            // 		var myCount = 0;
            //         var myGrade = "";
            // 		for (var w = 0; w < copy.length; w++) {
            // 			if (resultArray[i].resultGrade == copy[w].resultGrade) {
            //                 myGrade = copy[w].resultGrade;
            // 				myCount++;
            // 				delete copy[w].resultGrade;
            // 			}
            // 		}
            // 		if (myCount > 0) {
            // 			var a = new Object();
            // 			a.grade = myGrade;
            // 			a.total = myCount;
            // 			gradeAnalysis.push(a);
            // 		}
            // 	}
            // }
            //
            //
            // gradeDataArr.sort(function(a, b) {
            //     return parseFloat(a.grade) - parseFloat(b.grade);
            // });


            var availableGrade = [
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




            var data = {
                examtype: examtype,
                examterm: examterm,
                examyear: examyear,
                classForm: form,
                subject: subject,
                result: resultArray,
                availableGrade: availableGrade,
                classScore: classScore
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
