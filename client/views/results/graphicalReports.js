Template.graphicalReports.onRendered( function(){

    var examId = Session.get('examId');
    var classIdArr = Exams.findOne({_id: examId}).classes;
    var form = Session.get('formNumber');
    var stream = Session.get('streamName');
    var classIdCombined = Classes.find({_id: {$in: classIdArr}}, {Form: form}).map(function(classObject){
        return classObject._id;
    });

    var resultsData = [];

    var results = Results.find({exam: examId}).map(function(resultObj){
        var studentFirstName = Students.findOne({_id: resultObj.student}).firstName;
        var studentLastName = Students.findOne({_id: resultObj.student}).surname;
        var studentClassId = Students.findOne({_id: resultObj.student}).class;
        var studentClassStream = Classes.findOne({_id: studentClassId}).streamName;
        var studentGender = Students.findOne({_id: resultObj.student}).gender;
        var studentOverallGrade = resultObj.overallGrade;
        var studentOverallScore = resultObj.overallScore;
        var studentSubjectData = [];
        var studentSubjectArr = resultObj.subjects.forEach(function(subject){
            var subjectId = subject.subject;
            var subjectName = Subjects.findOne({_id: subjectId}).name;
            var subjectGrade = subject.grade;
            var subjectPoints = subject.points;
            var subjectScore = subject.score;
            studentSubjectData.push({
                subjectId: subjectId,
                subjectName: subjectName,
                subjectGrade: subjectGrade,
                subjectPoints: subjectPoints,
                subjectScore: subjectScore
            });
        });
        var subjectCount = studentSubjectData.length;
        resultsData.push({
            studentFirstName: studentFirstName,
            studentLastName: studentLastName,
            studentClassId: studentClassId,
            studentClassStream: studentClassStream,
            studentGender: studentGender,
            studentOverallGrade: studentOverallGrade,
            studentOverallScore: studentOverallScore,
            studentSubjectData: studentSubjectData,
            subjectCount: subjectCount
        });
    });


    var gradeAnalysisData = [];
    resultsData.forEach(function (a) {
        if (!this[a.studentOverallGrade]) {
            this[a.studentOverallGrade] = { studentGender: [], studentOverallGrade: a.studentOverallGrade };
            gradeAnalysisData.push(this[a.studentOverallGrade]);
        }
        this[a.studentOverallGrade].studentGender.push(a.studentGender);
    }, Object.create(null));

    var gradeAnalysis = [];
    gradeAnalysisData.map(function(data){
        var grade = data.studentOverallGrade;
        var total = data.studentGender.length;
        gradeAnalysis.push({
            grade: grade,
            total: total
        });
    });


    var boysResultsData = [];
    for(var index in resultsData){
        if(resultsData[index].studentGender == "male"){
            boysResultsData.push(resultsData[index]);
        }
    }
    var boysGradeAnalysis = [];
    var boysCopy = boysResultsData.slice(0);
    for (var i = 0; i < boysResultsData.length; i++) {
        var myGrade = "";
        var myCount = 0;
        for (var w = 0; w < boysCopy.length; w++) {
            if (boysResultsData[i].studentOverallGrade == boysCopy[w].studentOverallGrade) {
                myGrade = boysCopy[w].studentOverallGrade;
                myCount++;
                delete boysCopy[w].studentOverallGrade;
            }
        }
        if (myCount > 0) {
            boysGradeAnalysis.push({
                grade: myGrade,
                total: myCount
            });
        }
    }


    var girlsResultsData = [];
    for(var index in resultsData){
        if(resultsData[index].studentGender == "female"){
            girlsResultsData.push(resultsData[index]);
        }
    }
    var girlsGradeAnalysis = [];
    var girlsCopy = girlsResultsData.slice(0);
    for (var i = 0; i < girlsResultsData.length; i++) {
        var myGrade = "";
        var myCount = 0;
        for (var w = 0; w < girlsCopy.length; w++) {
            if (girlsResultsData[i].studentOverallGrade == girlsCopy[w].studentOverallGrade) {
                myGrade = girlsCopy[w].studentOverallGrade;
                myCount++;
                delete girlsCopy[w].studentOverallGrade;
            }
        }
        if (myCount > 0) {
            girlsGradeAnalysis.push({
                grade: myGrade,
                total: myCount
            });
        }
    }


    // boysVsGirls = [];


    var width = 600;
    var height = 600;

    nv.addGraph(function() {
        var chart = nv.models.pie()
                .x(function(d) { return d.grade; })
                .y(function(d) { return d.total; })
                .width(width)
                .height(height)
                .padAngle(.08)
                .cornerRadius(5)
                .labelsOutside(true)
                .donut(true)
                .title('total scores')
                .labelType(function(d, i, values) {
                    return values.key + ' = ' + values.value + ' students';
                })
                ;
        d3.select("#barChart")
                .datum([gradeAnalysis])
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);
        return chart;
    });

    nv.addGraph(function() {
        var chart = nv.models.pie()
                .x(function(d) { return d.grade; })
                .y(function(d) { return d.total; })
                .width(width)
                .height(height)
                .labelsOutside(true)
                .title('Male student scores')
                .labelType(function(d, i, values) {
                    return values.key + ' = ' + values.value + ' students';
                })
                ;
        d3.select("#pieChart2")
                .datum([boysGradeAnalysis])
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);
        return chart;
    });

    nv.addGraph(function() {
                var chart = nv.models.pie()
                .x(function(d) { return d.grade; })
                .y(function(d) { return d.total; })
                .width(width)
                .height(height)
                .labelsOutside(true)
                .title('Female student scores')
                .labelType(function(d, i, values) {
                    return values.key + ' = ' + values.value + ' students';
                })
                ;
        d3.select("#pieChart3")
                .datum([girlsGradeAnalysis])
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);
        return chart;
    });


    // var chart4;
    // nv.addGraph(function() {
    //     chart4 = nv.models.multiBarChart()
    //         .barColor(d3.scale.category20().range())
    //         .duration(300)
    //         .margin({bottom: 100, left: 70})
    //         .rotateLabels(45)
    //         .groupSpacing(0.1)
    //     ;
    //     chart4.reduceXTicks(false).staggerLabels(true);
    //     chart4.xAxis
    //         .axisLabel("grades achieved by students")
    //         .axisLabelDistance(35)
    //         .showMaxMin(false)
    //         .tickFormat(d3.format(',.6f'))
    //     ;
    //     chart4.yAxis
    //         .axisLabel("number of students")
    //         .axisLabelDistance(-5)
    //         .tickFormat(d3.format(',.01f'))
    //     ;
    //     chart4.dispatch.on('renderEnd', function(){
    //         nv.log('Render Complete');
    //     });
    //     d3.select('#chart4')
    //         .datum(boysVsGirls)
    //         .call(chart4);
    //     nv.utils.windowResize(chart4.update);
    //     chart4.dispatch.on('stateChange', function(e) {
    //         nv.log('New State:', JSON.stringify(e));
    //     });
    //     chart4.state.dispatch.on('change', function(state){
    //         nv.log('state', JSON.stringify(state));
    //     });
    //     return chart4;
    // });

});
