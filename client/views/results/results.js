Template.results.onCreated(function() {
	var self = this;
	self.autorun(function(){
        self.subscribe('studentImages');
        self.subscribe('students');
        self.subscribe('subjects');
        self.subscribe('exams');
        self.subscribe('classes');
        self.subscribe('results');
	});
});

Template.results.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	result: ()=> {
		return Results.find().fetch().reverse();
	},
    studentImage: function() {
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).image;
    },
    studentFirstName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).firstName;
    },
    studentLastName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).surname;
    },
    studentRegistrationNumber: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        return Students.findOne({_id: studentId}).registrationNumber;
    },
    studentClassStreamName: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).streamName;
    },
    studentClassForm: function(){
        var resultId = this._id
        var studentId = Results.findOne({_id: resultId}).student;
        var classId = Students.findOne({_id: studentId}).class;
        return Classes.findOne({_id: classId}).Form;
    },
    examType: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).type;
    },
    examTerm: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).term;
    },
    examYear: function(){
        var resultId = this._id
        var examId = Results.findOne({_id: resultId}).exam;
        return Exams.findOne({_id: examId}).year;
    },
    subjectCount: function(){
        var resultId = this._id
        return Results.findOne({_id: resultId}).subjects.length;
    }
});

Template.results.events({
  'keyup .searchbox' ( event, template ) {
    let value = event.target.value.trim();

    if ( value !== '' && event.keyCode === 13 ) {
      template.searchQuery.set( value );
      template.searching.set( true );
    }

    if ( value === '' ) {
      template.searchQuery.set( value );
    }
  }
});
