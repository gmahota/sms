Meteor.startup(function() {
    Results.find().map(function(resu){
        var id = resu._id;
        var subjectObjArray = resu.subjects;
        var newResults = [];
        for (var i = 0; i < subjectObjArray.length; i++){
            var score = subjectObjArray[i].score;
            var grade = subjectObjArray[i].grade;
            var points = subjectObjArray[i].points;
            var subject = subjectObjArray[i].subject;
            var subjectData = Subjects.findOne({_id: subject}).gradingScheme;
            var comments = subjectObjArray[i].comments;

            var mandatoryCheck = Subjects.findOne({_id: subject}).requirement;
            var mandatory = false;
            if (mandatoryCheck == "mandatory"){
                mandatory = true;
            }
            var type = Subjects.findOne({_id: subject}).type;
            newResults.push({
                subject: subject,
                grade: grade,
                points: points,
                score: score,
                comments: comments,
                mandatory: mandatory,
                type: type,
                selected: true
            });
        }

        var studentId = resu.student;
        var studentClassId = Students.findOne({_id: studentId}).class;
        var studentForm = Classes.findOne({_id: studentClassId}).Form;

        var totalScore = 0;
        var totalPoints = 0;
        for (var i = 0; i < newResults.length; i++) {
            totalScore += newResults[i].score << 0;
            totalPoints += newResults[i].points << 0;
        }

        if (studentForm == 3 || studentForm == 4){
            if (newResults.length > 7){
                var preResultCheck = newResults.slice();
                preResultCheck.sort(function(a, b) {
                    return parseFloat(a.score) - parseFloat(b.score);
                });
                var deductibleObjs = preResultCheck.filter(function( obj ) {
                  return obj.mandatory != true;
                });
                var scienceInDeductibles = deductibleObjs.filter(function( scienceObj ) {
                  return scienceObj.type == "sciences";
                });
                var scienceCount = scienceInDeductibles.length;

                var updatedDeductible = [];
                if (scienceCount = 1){
                    updatedDeductible = deductibleObjs.filter(function( scienceObj ) {
                      return scienceObj.type != "sciences";
                    });
                } else if (scienceCount > 1){
                    var flippedDeductibleObjs = deductibleObjs.slice();
                    flippedDeductibleObjs.sort(function(a, b) {
                        return parseFloat(b.score) - parseFloat(a.score);
                    });
                    var sciencePass = flippedDeductibleObjs.find(function(item){
                        return item.type == "sciences";
                    });
                    updatedDeductible = deductibleObjs.filter(function( scienceObj ) {
                      return scienceObj.subject != sciencePass.subject;
                    });
                }

                var deductibleObj = updatedDeductible[0];
                var deductibleScore = updatedDeductible[0].score;
                var deductiblePoint = updatedDeductible[0].points;
                var deductibleSubject = updatedDeductible[0].subject;

                for (var y = 0; y < newResults.length; y++){
                    var currentSubject = newResults[y].subject;
                    if (currentSubject == deductibleSubject){
                        newResults[y].selected = false;
                    }
                }

                totalScore = totalScore - deductibleScore;
                totalPoints = totalPoints - deductiblePoint;
            }
            var averagePoints = totalPoints / 7;
            var averageScore = totalScore / 7;

            var grade;
            var integerPoints = averagePoints.toFixed(1);

            if (integerPoints >= 11.5 && integerPoints <= 12){
                grade = "A";
            } else if (integerPoints >= 10.5 && integerPoints <= 11){
                grade = "A-";
            } else if (integerPoints >= 9.5 && integerPoints <= 10){
                grade = "B+";
            } else if (integerPoints >= 8.5 && integerPoints <= 9){
                grade = "B";
            } else if (integerPoints >= 7.5 && integerPoints <= 8){
                grade = "B-";
            } else if (integerPoints >= 6.5 && integerPoints <= 7){
                grade = "C+";
            } else if (integerPoints >= 5.5 && integerPoints <= 6){
                grade = "C";
            } else if (integerPoints >= 4.5 && integerPoints <= 5){
                grade = "C-";
            } else if (integerPoints >= 3.5 && integerPoints <= 4){
                grade = "D+";
            } else if (integerPoints >= 2.5 && integerPoints <= 3){
                grade = "D";
            } else if (integerPoints >= 1.5 && integerPoints <= 2){
                grade = "D-";
            } else if (integerPoints >= 0 && integerPoints <= 1){
                grade = "E";
            }

            Results.update(id, {
                $set: {
                    subjects: newResults,
                    overallScore: totalScore,
                    overallGrade: grade,
                    overallMean: averageScore.toFixed(1),
                    overallPoints: averagePoints.toFixed(3)
                }
            });
        } else if (studentForm == 1 || studentForm == 2){
            if(newResults.length >= 11){
                var averageScore = totalScore / newResults.length;
                var averagePoints = totalPoints / newResults.length;
                var grade;

                var integerPoints = averagePoints.toFixed(1);

                if (integerPoints >= 11.5 && integerPoints <= 12){
                    grade = "A";
                } else if (integerPoints >= 10.5 && integerPoints <= 11){
                    grade = "A-";
                } else if (integerPoints >= 9.5 && integerPoints <= 10){
                    grade = "B+";
                } else if (integerPoints >= 8.5 && integerPoints <= 9){
                    grade = "B";
                } else if (integerPoints >= 7.5 && integerPoints <= 8){
                    grade = "B-";
                } else if (integerPoints >= 6.5 && integerPoints <= 7){
                    grade = "C+";
                } else if (integerPoints >= 5.5 && integerPoints <= 6){
                    grade = "C";
                } else if (integerPoints >= 4.5 && integerPoints <= 5){
                    grade = "C-";
                } else if (integerPoints >= 3.5 && integerPoints <= 4){
                    grade = "D+";
                } else if (integerPoints >= 2.5 && integerPoints <= 3){
                    grade = "D";
                } else if (integerPoints >= 1.5 && integerPoints <= 2){
                    grade = "D-";
                } else if (integerPoints >= 0 && integerPoints <= 1){
                    grade = "E";
                }

                Results.update(id, {
                    $set: {
                        subjects: newResults,
                        overallScore: totalScore,
                        overallGrade: grade,
                        overallMean: averageScore.toFixed(1),
                        overallPoints: averagePoints.toFixed(3)
                    }
                });
            }

        }
    });
});
