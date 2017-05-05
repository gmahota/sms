Clubs = new Mongo.Collection('clubs');

if ( Meteor.isServer ) {
  Clubs._ensureIndex( { name: 1, _id: 1 } );
}

Clubs.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

ClubSchema = new SimpleSchema({
    name: {
		type: String
	},
    description: {
		type: String,
        label: "description of the club",
		autoform: {
	    	afFieldInput: {
		        type: 'summernote',
		        rows: 5,
		        class: 'editor',
		        settings: {
					toolbar: [
						['style', ['bold', 'underline', 'clear']],
						['para', ['ul']],
						['insert', ['link']]
					]
		        }
	    	}
	    }
	},
	createdAt: {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();  // Prevent user from supplying their own val
			}
		},
		autoform: {
			type: "hidden"
		}
	},
	updatedAt: {
		type: Date,
		autoValue: function() {
			if (this.isUpdate) {
				return new Date();
			}
		},
		denyInsert: true,
		optional: true,
		autoform: {
			type: "hidden"
		}
	}
});

Meteor.methods({
	deleteClub: function(id){
		Clubs.remove(id);
		FlowRouter.go('clubs');
	}
});

Clubs.attachSchema ( ClubSchema );
