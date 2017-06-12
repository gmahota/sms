Template.schools.onCreated(function() {
    var self = this;
	self.autorun(function(){
		self.subscribe('schoolImages');
	});

	let template = Template.instance();

	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );

	template.autorun( () => {
		template.subscribe( 'schoolSearch', template.searchQuery.get(), () => {
			setTimeout( () => {
				template.searching.set( false );
			}, 300 );
		});
	});
});

Template.schools.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	schools: ()=> {
		return Schools.find().fetch();
	},
    schoolCount: function(){
        return Schools.find().count();
    }
});

Template.schools.events({
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
