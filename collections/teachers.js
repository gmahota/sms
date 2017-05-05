Teachers = new Mongo.Collection('teachers');
TeacherImages = new FS.Collection('teacherImages', {
   stores: [new FS.Store.GridFS('teacherImages', {path: '~/uploads'})]
});

if ( Meteor.isServer ) {
    Teachers._ensureIndex( { firstName: 1, surname: 1, staffId: 1, _id: 1 } );
}

Teachers.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	}
});

TeacherImages.allow({
	insert: function(userId, doc) {
		return true;
	},
	update: function(userId, doc) {
		return true;
	},
	download: function(userId, doc) {
		return true;
	},
	remove: function(userId, doc) {
		return true;
	}
});


TeacherSchema = new SimpleSchema({
    firstName: {
		type: String
	},
    surname: {
		type: String
	},
    gender: {
        type: String,
        label: "The gender of the teacher",
        autoform: {
            type: 'select2',
            options: [
                {value: "", label: "select one"},
                {value:"male", label: "male"},
                {value:"female", label: "female"}
            ]
        }
    },
    staffId: {
		type: String
	},
    subjects: {
        type: [String],
        label: "choose the subject(s) the teacher teaches",
        autoform: {
        	type: 'universe-select',
        	afFieldInput: {
	        	multiple: true,
	        	min: 1,
	        	valuesLimit: 10
	      	},
            options: function () {
                var options = [];
                Subjects.find({}).forEach(function (element) {
                    options.push({
                        label: element.name, value: element._id
                    })
                });
                return options;
            }
        }
    },
    image: {
        type: String,
        label: "image of the teacher",
        autoform: {
        	afFieldInput: {
        		type: "fileUpload",
		        collection: "teacherImages",
		        accept: 'image/*',
                label: "add teacher's image here"
        	}
        }
    },
    homeAddress: {
		type: String
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
	deleteTeacher: function(id, imageId){
		Teachers.remove(id);
		TeacherImages.remove(imageId);
		FlowRouter.go('teachers');
	}
});

Teachers.attachSchema ( TeacherSchema );
