Template.timetables.onCreated(function() {
	var self = this;
	self.autorun(function(){
        self.subscribe('classes');
        self.subscribe('timetables');
	});

	Session.set("year", null);
	Session.set("term", null);
	Session.set("classId", null);

    self.classSelected = new ReactiveVar(false);
    self.termSelected = new ReactiveVar(false);
    self.yearSelected = new ReactiveVar(false);
});

Template.timetables.helpers({
	class: function(){
		return Classes.find();
	},
	years: function(){
		var yearsArr = [
			{year: "2017"},
			{year: "2018"},
			{year: "2019"},
			{year: "2020"},
			{year: "2021"},
			{year: "2022"},
			{year: "2023"},
			{year: "2024"},
			{year: "2025"},
			{year: "2026"},
			{year: "2027"}
		];
		return yearsArr;
	},
	terms: function(){
		var termData = [
			{termName: "first-term"},
			{termName: "second-term"},
			{termName: "third-term"}
		];
		return termData;
	},
	subject: function(){
		return Subjects.find();
	},
    timetable: function() {
        var classSelected = Template.instance().classSelected.get();
		var termSelected = Template.instance().termSelected.get();
        var yearSelected = Template.instance().yearSelected.get();
		var year = Session.get('year');
        var term = Session.get('term');
		var classId = Session.get('classId');
		if (yearSelected){
			if(year){
				if(termSelected){
					if(term){
                        if(classSelected){
                            if(classId){
        						return Timetables.find({year: year, term: term, class: classId});
                            } else {
                                return;
                            }
                        } else {
                            return;
                        }
					} else {
						return;
					}
				} else {
					return;
				}
			} else {
				return;
			}
		} else {
			return;
		}
    },
    classForm: function(){
        var id = this.class;
        return Classes.findOne({_id: id}).Form;
    },
    classStreamName: function(){
        var id = this.class;
        return Classes.findOne({_id: id}).streamName;
    },
    classSelect: function() {
		return Template.instance().classSelected.get();
	},
    termSelect: function() {
		return Template.instance().termSelected.get();
	},
    yearSelect: function() {
		return Template.instance().yearSelected.get();
	}
});

Template.timetables.events({
	'change .class-list': function(event, template){
		var myList = document.getElementById("classList");
        var current = Template.instance().classSelected.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
        if (selectedValue){
            if (current) {
                template.classSelected.set(false);
                template.classSelected.set(true);
            } else {
                template.classSelected.set( true );
            }
            Session.set('classId', selectedValue );
        }
	},
	'change .term-list': function(event, template){
		var myList = document.getElementById("termList");
        var current = Template.instance().termSelected.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
        if (selectedValue){
    		if (!current) {
                template.termSelected.set(true);
            } else {
                template.termSelected.set(false);
                template.termSelected.set(true);
            }
            Session.set('term', selectedValue );
        }
	},
	'change .year-list': function(event, template){
		var myList = document.getElementById("yearList");
        var current = Template.instance().yearSelected.get();
		var selectedValue = myList.options[myList.selectedIndex].value;
        if (selectedValue){
    		if (!current) {
                template.yearSelected.set(true);
            } else {
                template.yearSelected.set(false);
                template.yearSelected.set(true);
            }
            Session.set('year', selectedValue );
        }
	}
});
