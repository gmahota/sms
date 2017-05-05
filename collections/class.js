Classes = new Mongo.Collection('classes');

if ( Meteor.isServer ) {
  Classes._ensureIndex( { streamName: 1, Form: 1, _id: 1 } );
}

Classes.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

ClassSchema = new SimpleSchema({
    streamName: {
		type: String
	},
    Form: {
        type: Number,
        label: "the form of the class",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"1", label: "1"},
                {value:"2", label: "2"},
                {value:"3", label: "3"},
                {value:"4", label: "4"}
            ]
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
	deleteClass: function(id){
		Classes.remove(id);
		FlowRouter.go('classes');
	}
});

Classes.attachSchema ( ClassSchema );
