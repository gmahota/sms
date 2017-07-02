Template.students.onCreated(function() {
	var self = this;
	self.autorun(function(){
		self.subscribe('studentImages');
		self.subscribe('classes');
	});

	let template = Template.instance();

	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );

	template.autorun( () => {
		template.subscribe( 'studentSearch', template.searchQuery.get(), () => {
			setTimeout( () => {
				template.searching.set( false );
			}, 300 );
		});
	});
});

Template.students.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	student: ()=> {
		return Students.find({active: true}).fetch();
	},
	classes: ()=> {
		return Classes.find({active: true});
	}
});

Template.students.events({
	'keyup .searchbox' ( event, template ) {
	    let value = event.target.value.trim();

	    if ( value !== '' && event.keyCode === 13 ) {
	      template.searchQuery.set( value );
	      template.searching.set( true );
	    }

	    if ( value === '' ) {
	      template.searchQuery.set( value );
	    }
	},
	'change .class-sort': function (event, template) {
		var myList = document.getElementById("class-sort");
		var value = myList.options[myList.selectedIndex].value;
		console.log(value);

	    if ( value !== '') {
	      template.searchQuery.set( value );
	      template.searching.set( true );
	    }

	    if ( value === '' ) {
	      template.searchQuery.set( value );
	    }
	}
});
