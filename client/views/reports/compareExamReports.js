Template.compareExamReports.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('classes');
		self.subscribe('exams');
		self.subscribe('students');
		self.subscribe('subjects');
		self.subscribe('results');
	});
	Session.set('examId', null);
	Session.set('yearId', null);
	Session.set('termName', null);
    Session.set('formNumber', null);
    Session.set('streamName', null);
});

Template.compareExamReports.helpers({
	year: function(){
		var data = Exams.find({active: true}).map(function(exam){
			return exam.year;
		});
		var noDupeObj = {}
        for (i = 0, n = data.length; i < n; i++) {
            var item = data[i];
            noDupeObj[item] = item;
        }
        var i = 0;
        var cleanData = [];
        for (var item in noDupeObj) {
            cleanData[i++] = noDupeObj[item];
        }
        return cleanData
	},
	term: function(){
		var yearSource = Session.get('yearId');
		var yearSelection = yearSource * 1;
		if (yearSelection) {
			var data = Exams.find({active: true, year: yearSelection}).map(function(exam){
				return exam.term;
			});
			var noDupeObj = {}
	        for (i = 0, n = data.length; i < n; i++) {
	            var item = data[i];
	            noDupeObj[item] = item;
	        }
	        var i = 0;
	        var cleanData = [];
	        for (var item in noDupeObj) {
	            cleanData[i++] = noDupeObj[item];
	        }
	        return cleanData;
		}

	},
    forms: function(){
		var yearSource = Session.get('yearId');
		var yearSelection = yearSource * 1;
		var termSelection = Session.get('termName');
		var examIds = Exams.find({active: true, year: yearSelection, term: termSelection}).map(function(exam){
			return exam._id;
		});
        var formObj = [];
		var classCheck = Results.find({exam: {$in: examIds}}).map(function(result){
			var studentId = result.student;
			return Students.findOne({_id: studentId}).class;
		});
        var classNumbers = Classes.find({_id: {$in: classCheck}}).map(function(classObj){
            var form = classObj.Form;
            formObj.push({
                formNumber: form
            });
        });

        var noDupeObj = {}
        for (i = 0, n = formObj.length; i < n; i++) {
            var item = formObj[i];
            noDupeObj[item.formNumber ] = item;
        }
        var i = 0;
        var cleanData = [];
        for (var item in noDupeObj) {
            cleanData[i++] = noDupeObj[item];
        }

        return cleanData;
    },
    classStream: function(){
		var yearSource = Session.get('yearId');
		var yearSelection = yearSource * 1;
		var termSelection = Session.get('termName');
		var examIds = Exams.find({active: true, year: yearSelection, term: termSelection}).map(function(exam){
			return exam._id;
		});
        var form = Session.get('formNumber');
        var streamObj = [];
		var classCheck = Results.find({exam: {$in: examIds}}).map(function(result){
			var studentId = result.student;
			return Students.findOne({_id: studentId}).class;
		});
        var classNumbers = Classes.find({_id: {$in: classCheck}}, { Form: form}).map(function(classObj){
            var strName = classObj.streamName;
            streamObj.push({
                streamName: strName
            });
        });

		var noDupeObj = {}
        for (i = 0, n = streamObj.length; i < n; i++) {
            var item = streamObj[i];
            noDupeObj[item.streamName] = item;
        }
        var i = 0;
        var cleanData = [];
        for (var item in noDupeObj) {
            cleanData[i++] = noDupeObj[item];
        }

        return cleanData;
    },
	yearSelected: function(){
        var selection = Session.get('yearId');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
	termSelected: function(){
        var selection = Session.get('termName');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
	formSelected: function(){
        var selection = Session.get('formNumber');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
	streamSelected: function(){
        var selection = Session.get('streamName');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
	isCombined: function(){
        var stream = Session.get('streamName');
		if (stream == "combined"){
			return true;
		} else {
			return false;
		}
	},
	subjects: function(){
		return Subjects.find({active: true});
	}
});

Template.compareExamReports.events({
	'change .year-list': function(){
		var myList = document.getElementById("yearList");
		var yearId = myList.options[myList.selectedIndex].value;
		Session.set('yearId', yearId);
	},
	'change .term-list': function(){
		var myList = document.getElementById("termList");
		var termName = myList.options[myList.selectedIndex].value;
		Session.set('termName', termName);
	},
    'change .form-list': function(){
		var myList = document.getElementById("formList");
		var form = myList.options[myList.selectedIndex].value;
		Session.set('formNumber', form);
	},
    'change .stream-list': function(){
		var myList = document.getElementById("streamList");
		var streamName = myList.options[myList.selectedIndex].value;
		Session.set('streamName', streamName);
	},
	'click .print-class-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var subjectList = document.getElementById("examList");
		var yearId = Session.get('yearId');
		var termName = Session.get('termName');
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (yearId && termName && form && stream ){
            if (stream == "combined") {
                Meteor.call('compareCombinedClassResult', yearId, termName, form, function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            } else {
                Meteor.call('compareSingleClassResult', yearId, termName, form, stream, function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            }

		} else {
			$('.processing').removeClass('show');
			Bert.alert('select the exam and class', 'danger');
		}
	},
	'click .print-male-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var yearId = Session.get('yearId');
		var termName = Session.get('termName');
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (yearId && termName && form && stream ){
            if (stream == "combined") {
                Meteor.call('compareCombinedGenderResult', yearId, termName, form, "male", function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            } else {
                Meteor.call('compareClassGenderResult', yearId, termName, form, stream, "male", function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            }
		} else {
			$('.processing').removeClass('show');
			Bert.alert('select the exam and class', 'danger');
		}
	},

	'click .print-female-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var yearId = Session.get('yearId');
		var termName = Session.get('termName');
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (yearId && termName && form && stream ){
            if (stream == "combined") {
                Meteor.call('compareCombinedGenderResult', yearId, termName, form, "female", function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            } else {
                Meteor.call('compareClassGenderResult', yearId, termName, form, stream, "female", function(err, res) {
    		    	if (err) {
    					$('.processing').removeClass('show');
    					Bert.alert(err.reason, 'danger');
    		      	} else if (res) {
    					$('.processing').removeClass('show');
    					Bert.alert('the file is ready', 'success');
    					window.open("data:application/pdf;base64, " + res, '_blank');
    		      	}
    		    })
            }
		} else {
			$('.processing').removeClass('show');
			Bert.alert('select the exam and class', 'danger');
		}
	},
	'click .print-subject-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var yearId = Session.get('yearId');
		var termName = Session.get('termName');
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		var subjectId = $('[name=subject-list]').val();

		if (yearId && termName && form && stream ){
            if (subjectId){
				if (stream == "combined") {
	                Meteor.call('compareSubjectCombinedExamReport', yearId, termName, form, subjectId, function(err, res) {
	    		    	if (err) {
	    					$('.processing').removeClass('show');
	    					Bert.alert(err.reason, 'danger');
	    		      	} else if (res) {
	    					$('.processing').removeClass('show');
	    					Bert.alert('the file is ready', 'success');
	    					window.open("data:application/pdf;base64, " + res, '_blank');
	    		      	}
	    		    })
	            } else {
	                Meteor.call('compareSubjectClassReport', yearId, termName, form, stream, subjectId, function(err, res) {
	    		    	if (err) {
	    					$('.processing').removeClass('show');
	    					Bert.alert(err.reason, 'danger');
	    		      	} else if (res) {
	    					$('.processing').removeClass('show');
	    					Bert.alert('the file is ready', 'success');
	    					window.open("data:application/pdf;base64, " + res, '_blank');
	    		      	}
	    		    })
	            }
			} else {
				$('.processing').removeClass('show');
				Bert.alert('select the subject', 'danger');
			}
		} else {
			$('.processing').removeClass('show');
			Bert.alert('select the exam and class', 'danger');
		}
	}
});
