Meteor.publish('classes', function(){
	return Classes.find({}, {sort: {Form: 1}});
});
Meteor.publish( 'classSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { Form: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { streamName: regex },
		{ Form: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Classes.find( query, projection );
});
Meteor.publish('singleClass', function(id){
  check(id, String);
  return Classes.find({_id: id});
});

Meteor.publish('clubs', function(){
	return Clubs.find();
});
Meteor.publish( 'clubSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { name: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { name: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Clubs.find( query, projection );
});
Meteor.publish('singleClub', function(id){
  check(id, String);
  return Clubs.find({_id: id});
});


Meteor.publish('exams', function(){
	return Exams.find({}, {sort: {year: 1, term: 1}});
});
Meteor.publish( 'examSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { year: 1, term: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { type: regex },
		{ term: regex },
		{ year: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Exams.find( query, projection );
});
Meteor.publish('singleExam', function(id){
  check(id, String);
  return Exams.find({_id: id});
});

Meteor.publish('results', function(){
	return Results.find();
});
Meteor.publish('singleResult', function(id){
  check(id, String);
  return Results.find({_id: id});
});

Meteor.publish('sports', function(){
	return Sports.find();
});
Meteor.publish( 'sportSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { name: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { name: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Sports.find( query, projection );
});
Meteor.publish('singleSport', function(id){
  check(id, String);
  return Sports.find({_id: id});
});

Meteor.publish('students', function(){
	return Students.find();
});
Meteor.publish( 'studentSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { firstName: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { firstName: regex },
		{ surname: regex },
		{ registrationNumber: regex },
		{ yearOfAdmission: regex },
		{ class: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Students.find( query, projection );
});
Meteor.publish('studentImages', function(){
	return StudentImages.find();
});
Meteor.publish('singleStudent', function(id){
  check(id, String);
  return Students.find({_id: id});
});
Meteor.publish('singleStudentImage', function(id){
  check(id, String);
  return StudentImages.find({_id: id});
});

Meteor.publish('subjects', function(){
	return Subjects.find();
});
Meteor.publish( 'subjectSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { order: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { name: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Subjects.find( query, projection );
});
Meteor.publish('singleSubject', function(id){
  check(id, String);
  return Subjects.find({_id: id});
});


Meteor.publish('timetables', function(){
	return Timetables.find();
});
Meteor.publish('singleTimetable', function(id){
  check(id, String);
  return Timetables.find({_id: id});
});



//USERS
Meteor.publish('allUsers', function(){
	return Meteor.users.find({sort: { 'profile.firstname': 1 }});
});
Meteor.publish('teachers', function(){
	return Meteor.users.find({'roles.__global_roles__':'teacher'});
});
Meteor.publish(null, function (){
  return Meteor.roles.find()
});
Meteor.publish('singleUser', function(id){
  check(id, String);
  return Meteor.users.find({_id: id});
});
Meteor.publish('userImage', function(){
  return UserImage.find();
});


//SCHOOL
Meteor.publish( 'schoolSearch', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );
  let query = {},
      projection = { limit: 1000, sort: { name: 1 } };
  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {
      $or: [
        { name: regex },
		{ schoolNumber: regex },
        { _id: regex }
      ]
    };
    projection.limit = 100;
  }
  return Schools.find( query, projection );
});
Meteor.publish('schools', function(){
	return Schools.find();
});
Meteor.publish('schoolImages', function(){
  return SchoolImages.find();
});
Meteor.publish('singleSchool', function(id){
  check(id, String);
  return Schools.find({_id: id});
});
