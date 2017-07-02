Meteor.methods({
    'classListPdf': function(classId, teacherId, subjectId) {
        if (Meteor.isServer) {
          // SETUP
          // Grab required packages
          var webshot = Meteor.npmRequire('webshot');
          var fs      = Npm.require('fs');
          var Future = Npm.require('fibers/future');

          var fut = new Future();

          var fileName = "class-list.pdf";

          // GENERATE HTML STRING
          var css = Assets.getText('merged-stylesheets.css');

          SSR.compileTemplate('layout', Assets.getText('layout.html'));

          Template.layout.helpers({
            getDocType: function() {
              return "<!DOCTYPE html>";
            }
          });

          SSR.compileTemplate('class_list', Assets.getText('class-list.html'));

          // PREPARE DATA
            var classForm = Classes.findOne({_id: classId}).Form;
            var classStreamName = Classes.findOne({_id: classId}).streamName;
            var subjectName = Subjects.findOne({_id: subjectId}).name;
            var student = Students.find({class: classId});
            var teacherFirstname = Meteor.users.findOne({_id: teacherId}).profile.firstname;
            var teacherLastname = Meteor.users.findOne({_id: teacherId}).profile.lastname;

            var data = {
                subjectName: subjectName,
                teacherFirstname: teacherFirstname,
                teacherLastname: teacherLastname,
                classForm: classForm,
                classStreamName: classStreamName,
                student: student
            }

            var html_string = SSR.render('layout', {
                css: css,
                template: "class_list",
                data: data
            });

            console.log(html_string);
            // Setup Webshot options
            var options = {
                "paperSize": {
                    "format": "Letter",
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
