Template.generateResults.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('classes');
		self.subscribe('exams');
		self.subscribe('students');
		self.subscribe('subjects');
		self.subscribe('results');
	});
	Session.set('examId', null);
    Session.set('formNumber', null);
    Session.set('streamName', null);
});

Template.generateResults.helpers({
	exams: function(){
		return Exams.find({active: true});
	},
    examSelected: function(){
        var selection = Session.get('examId');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
    forms: function(){
        var examId = Session.get('examId');
        var formObj = [];
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var classNumbers = Classes.find({_id: {$in: classIdArr}}).map(function(classObj){
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
    formSelected: function(){
        var selection = Session.get('formNumber');
        if (selection == null){
            return false;
        } else {
            return true;
        }
    },
    classStream: function(){
        var examId = Session.get('examId');
        var form = Session.get('formNumber');
        var streamObj = [];
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var classNumbers = Classes.find({_id: {$in: classIdArr}}, { Form: form}).map(function(classObj){
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

Template.generateResults.events({
	'change .exam-list': function(){
		var myList = document.getElementById("examList");
		var examId = myList.options[myList.selectedIndex].value;
		Session.set('examId', examId);
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
		var examId = Session.get('examId');
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (examId && form && stream ){
            if (stream == "combined") {
                var classId = Classes.find({_id: {$in: classIdArr}}, {Form: form}).map(function(classObject){
                    return classObject._id;
                });
                Meteor.call('combinedResultsPdf', classId, examId, form, function(err, res) {
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
                var classObj = Classes.findOne({"_id": {$in: classIdArr}, "streamName": stream, "Form": (form * 1)});
                var classId = classObj._id;
                Meteor.call('classResultsPdf', classId, examId, function(err, res) {
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
	'click .print-class-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var subjectList = document.getElementById("examList");
		var examId = Session.get('examId');
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (examId && form && stream ){
            if (stream == "combined") {
                var classId = Classes.find({_id: {$in: classIdArr}}, {Form: form}).map(function(classObject){
                    return classObject._id;
                });
                Meteor.call('combinedResultsPdf', classId, examId, form, function(err, res) {
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
                var classObj = Classes.findOne({"_id": {$in: classIdArr}, "streamName": stream, "Form": (form * 1)});
                var classId = classObj._id;
                Meteor.call('classResultsPdf', classId, examId, function(err, res) {
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
		var subjectList = document.getElementById("examList");
		var examId = Session.get('examId');
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (examId && form && stream ){
            if (stream == "combined") {
                var classId = Classes.find({_id: {$in: classIdArr}}, {Form: form}).map(function(classObject){
                    return classObject._id;
                });
                Meteor.call('combinedGenderResultsPdf', classId, examId, form, "male", function(err, res) {
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
                var classObj = Classes.findOne({"_id": {$in: classIdArr}, "streamName": stream, "Form": (form * 1)});
                var classId = classObj._id;
                Meteor.call('classGenderResultsPdf', classId, examId, "male", function(err, res) {
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
		var subjectList = document.getElementById("examList");
		var examId = Session.get('examId');
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (examId && form && stream ){
            if (stream == "combined") {
                var classId = Classes.find({_id: {$in: classIdArr}}, {Form: form}).map(function(classObject){
                    return classObject._id;
                });
                Meteor.call('combinedGenderResultsPdf', classId, examId, form, "female", function(err, res) {
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
                var classObj = Classes.findOne({"_id": {$in: classIdArr}, "streamName": stream, "Form": (form * 1)});
                var classId = classObj._id;
                Meteor.call('classGenderResultsPdf', classId, examId, "female", function(err, res) {
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

	'click .print-empty-results': function(e){
		e.preventDefault();
		$('.processing').addClass('show');
		var subjectList = document.getElementById("examList");
		var examId = Session.get('examId');
        var classIdArr = Exams.findOne({_id: examId}).classes;
        var form = Session.get('formNumber');
        var stream = Session.get('streamName');
		if (examId && form && stream ){
            if (stream != "combined") {
                var classObj = Classes.findOne({"_id": {$in: classIdArr}, "streamName": stream, "Form": (form * 1)});
                var classId = classObj._id;
                Meteor.call('emptyClassResultsPdf', classId, examId, function(err, res) {
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

	}
});
