Template.classes.onCreated(function() {
	let template = Template.instance();

	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );

	template.autorun( () => {
		template.subscribe( 'classSearch', template.searchQuery.get(), () => {
			setTimeout( () => {
				template.searching.set( false );
			}, 300 );
		});
	});
});

Template.classes.helpers({
	searching() {
		return Template.instance().searching.get();
	},
	query() {
		return Template.instance().searchQuery.get();
	},
	class: ()=> {
		return Classes.find().fetch();
	},
	isdeactivated: function(){
		var id = this._id;
		var activeState = Classes.findOne({_id: id}).active;
		if(activeState == false){
			return true;
		} else {
			return false;
		}
	}
});

Template.classes.events({
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
