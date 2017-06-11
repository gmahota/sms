if (Meteor.isClient){
	Accounts.onLogin(function(){
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['admin'])) {
			FlowRouter.go('home');
		} else {
			FlowRouter.go('home');
		}
	});
	Accounts.onLogout(function(){
		FlowRouter.go('login');
	});
}



FlowRouter.route('/', {
	name: 'home',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'homepage' });
	}
});

//=======USER=======
FlowRouter.route('/login', {
	name: 'login',
	action(){
		if(Meteor.userId()){
			FlowRouter.go('home');
		}
		BlazeLayout.render('creationLayout', { main: 'login' });
	}
});
FlowRouter.route('/register', {
	name: 'register',
	action(){
		if(Meteor.userId()){
			FlowRouter.go('home');
		}
		BlazeLayout.render('creationLayout', { main: 'register' });
	}
});
FlowRouter.route('/forgot-password', {
	name: 'forgotPassword',
	action(){
		if(Meteor.userId()){
			FlowRouter.go('home');
		}
		BlazeLayout.render('creationLayout', { main: 'forgotPassword' });
	}
});
FlowRouter.route('/admin/:id', {
	name: 'adminProfile',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'adminProfile' });
	}
});

FlowRouter.route('/teachers', {
	name: 'teachers',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'teachers' });
	}
});
FlowRouter.route('/teacher/:id', {
	name: 'singleTeacher',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'teacherDetail' });
	}
});
FlowRouter.route('/edit-teacher/:id', {
	name: 'editSingleTeacher',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'teacherEdit' });
	}
});

//==============

FlowRouter.route('/clubs', {
	name: 'clubs',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'clubs' });
	}
});
FlowRouter.route('/club/:id', {
	name: 'singleClub',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'clubDetail' });
	}
});
FlowRouter.route('/edit-club/:id', {
	name: 'editSingleClub',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'clubEdit' });
	}
});
FlowRouter.route('/add-club', {
	name: 'addClub',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addClub' });
	}
});

FlowRouter.route('/sports', {
	name: 'sports',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'sports' });
	}
});
FlowRouter.route('/sport/:id', {
	name: 'singleSport',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'sportDetail' });
	}
});
FlowRouter.route('/edit-sport/:id', {
	name: 'editSingleSport',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'sportEdit' });
	}
});
FlowRouter.route('/add-sport', {
	name: 'addSport',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addSport' });
	}
});

FlowRouter.route('/classes', {
	name: 'classes',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'classes' });
	}
});
FlowRouter.route('/class/:id', {
	name: 'singleClass',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'classDetail' });
	}
});
FlowRouter.route('/edit-class/:id', {
	name: 'editSingleClass',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'classEdit' });
	}
});
FlowRouter.route('/add-class', {
	name: 'addClass',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addClass' });
	}
});

FlowRouter.route('/exams', {
	name: 'exams',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'exams' });
	}
});
FlowRouter.route('/exam/:id', {
	name: 'singleExam',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'examDetail' });
	}
});
FlowRouter.route('/edit-exam/:id', {
	name: 'editSingleExam',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'examEdit' });
	}
});
FlowRouter.route('/add-exam', {
	name: 'addExam',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addExam' });
	}
});

FlowRouter.route('/results', {
	name: 'results',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'results' });
	}
});
FlowRouter.route('/result/:id', {
	name: 'singleResult',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'resultDetail' });
	}
});
FlowRouter.route('/add-result', {
	name: 'addResult',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('creationLayout', { main: 'addResult' });
	}
});


FlowRouter.route('/class-results', {
	name: 'classResults',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'generateResults' });
	}
});



FlowRouter.route('/students', {
	name: 'students',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'students' });
	}
});
FlowRouter.route('/student/:id', {
	name: 'singleStudent',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'studentDetail' });
	}
});
FlowRouter.route('/edit-student/:id', {
	name: 'editSingleStudent',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'studentEdit' });
	}
});
FlowRouter.route('/add-student', {
	name: 'addStudent',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addStudent' });
	}
});

FlowRouter.route('/subjects', {
	name: 'subjects',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'subjects' });
	}
});
FlowRouter.route('/subject/:id', {
	name: 'singleSubject',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'subjectDetail' });
	}
});
FlowRouter.route('/edit-subject/:id', {
	name: 'editSingleSubject',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'subjectEdit' });
	}
});
FlowRouter.route('/add-subject', {
	name: 'addSubject',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'addSubject' });
	}
});

FlowRouter.route('/timetables', {
	name: 'timetables',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'timetables' });
	}
});
FlowRouter.route('/timetable/:id', {
	name: 'singleTimetable',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		BlazeLayout.render('mainLayout', { main: 'timetableDetail' });
	}
});
FlowRouter.route('/add-timetable', {
	name: 'addTimetable',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('creationLayout', { main: 'addTimetable' });
	}
});


//======SCHOOL=====
FlowRouter.route('/school/:id', {
	name: 'school',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'schoolProfile' });
	}
});
FlowRouter.route('/edit-school/:id', {
	name: 'editSchool',
	action(){
		if(!Meteor.userId()){
			FlowRouter.go('login');
		}
		var userId = Meteor.userId();
		if (Roles.userIsInRole(userId, ['teacher'])) {
			FlowRouter.go('home');
		}
		BlazeLayout.render('mainLayout', { main: 'editSchool' });
	}
});
FlowRouter.route('/add-school', {
	name: 'addSchool',
	action(){
		if(Meteor.userId()){
			FlowRouter.go('home');
		}
		BlazeLayout.render('creationLayout', { main: 'addSchool' });
	}
});
