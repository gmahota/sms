Sports = new Mongo.Collection('sports');

if ( Meteor.isServer ) {
  Sports._ensureIndex( { name: 1, _id: 1 } );
}

Sports.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

SportSchema = new SimpleSchema({
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
    active: {
        type: Boolean,
        defaultValue: true,
        optional: true,
        autoform: {
            type: "hidden"
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
	deleteSport: function(id){
		Sports.remove(id);
		FlowRouter.go('sports');
	},
    deactivateSport: function(id, activeState){
        check(id, String);
        var status = Sports.findOne({_id: id}).active;
        if(status == true){
            Sports.update(id, {
                $set: {
                    active: false
                }
            });
        } else {
            Sports.update(id, {
                $set: {
                    active: true
                }
            });
        }
    }
});

Sports.attachSchema ( SportSchema );
