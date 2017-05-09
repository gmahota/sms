FlowRouter.route('/', {
	name: 'home',
	action(){
		BlazeLayout.render('mainLayout', { main: 'homepage' });
	}
});

FlowRouter.route('/clubs', {
	name: 'clubs',
	action(){
		BlazeLayout.render('mainLayout', { main: 'clubs' });
	}
});
FlowRouter.route('/club/:id', {
	name: 'singleClub',
	action(){
		BlazeLayout.render('mainLayout', { main: 'clubDetail' });
	}
});
FlowRouter.route('/edit-club/:id', {
	name: 'editSingleClub',
	action(){
		BlazeLayout.render('mainLayout', { main: 'clubEdit' });
	}
});
FlowRouter.route('/add-club', {
	name: 'addClub',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addClub' });
	}
});

FlowRouter.route('/sports', {
	name: 'sports',
	action(){
		BlazeLayout.render('mainLayout', { main: 'sports' });
	}
});
FlowRouter.route('/sport/:id', {
	name: 'singleSport',
	action(){
		BlazeLayout.render('mainLayout', { main: 'sportDetail' });
	}
});
FlowRouter.route('/edit-sport/:id', {
	name: 'editSingleSport',
	action(){
		BlazeLayout.render('mainLayout', { main: 'sportEdit' });
	}
});
FlowRouter.route('/add-sport', {
	name: 'addSport',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addSport' });
	}
});

FlowRouter.route('/classes', {
	name: 'classes',
	action(){
		BlazeLayout.render('mainLayout', { main: 'classes' });
	}
});
FlowRouter.route('/class/:id', {
	name: 'singleClass',
	action(){
		BlazeLayout.render('mainLayout', { main: 'classDetail' });
	}
});
FlowRouter.route('/edit-class/:id', {
	name: 'editSingleClass',
	action(){
		BlazeLayout.render('mainLayout', { main: 'classEdit' });
	}
});
FlowRouter.route('/add-class', {
	name: 'addClass',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addClass' });
	}
});

FlowRouter.route('/exams', {
	name: 'exams',
	action(){
		BlazeLayout.render('mainLayout', { main: 'exams' });
	}
});
FlowRouter.route('/exam/:id', {
	name: 'singleExam',
	action(){
		BlazeLayout.render('mainLayout', { main: 'examDetail' });
	}
});
FlowRouter.route('/edit-exam/:id', {
	name: 'editSingleExam',
	action(){
		BlazeLayout.render('mainLayout', { main: 'examEdit' });
	}
});
FlowRouter.route('/add-exam', {
	name: 'addExam',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addExam' });
	}
});

FlowRouter.route('/results', {
	name: 'results',
	action(){
		BlazeLayout.render('mainLayout', { main: 'results' });
	}
});
FlowRouter.route('/result/:id', {
	name: 'singleResult',
	action(){
		BlazeLayout.render('mainLayout', { main: 'resultDetail' });
	}
});
FlowRouter.route('/add-result', {
	name: 'addResult',
	action(){
		BlazeLayout.render('creationLayout', { main: 'addResult' });
	}
});

FlowRouter.route('/students', {
	name: 'students',
	action(){
		BlazeLayout.render('mainLayout', { main: 'students' });
	}
});
FlowRouter.route('/student/:id', {
	name: 'singleStudent',
	action(){
		BlazeLayout.render('mainLayout', { main: 'studentDetail' });
	}
});
FlowRouter.route('/edit-student/:id', {
	name: 'editSingleStudent',
	action(){
		BlazeLayout.render('mainLayout', { main: 'studentEdit' });
	}
});
FlowRouter.route('/add-student', {
	name: 'addStudent',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addStudent' });
	}
});

FlowRouter.route('/subjects', {
	name: 'subjects',
	action(){
		BlazeLayout.render('mainLayout', { main: 'subjects' });
	}
});
FlowRouter.route('/subject/:id', {
	name: 'singleSubject',
	action(){
		BlazeLayout.render('mainLayout', { main: 'subjectDetail' });
	}
});
FlowRouter.route('/edit-subject/:id', {
	name: 'editSingleSubject',
	action(){
		BlazeLayout.render('mainLayout', { main: 'subjectEdit' });
	}
});
FlowRouter.route('/add-subject', {
	name: 'addSubject',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addSubject' });
	}
});

FlowRouter.route('/teachers', {
	name: 'teachers',
	action(){
		BlazeLayout.render('mainLayout', { main: 'teachers' });
	}
});
FlowRouter.route('/teacher/:id', {
	name: 'singleTeacher',
	action(){
		BlazeLayout.render('mainLayout', { main: 'teacherDetail' });
	}
});
FlowRouter.route('/edit-teacher/:id', {
	name: 'editSingleTeacher',
	action(){
		BlazeLayout.render('mainLayout', { main: 'teacherEdit' });
	}
});
FlowRouter.route('/add-teacher', {
	name: 'addTeacher',
	action(){
		BlazeLayout.render('mainLayout', { main: 'addTeacher' });
	}
});

FlowRouter.route('/timetables', {
	name: 'timetables',
	action(){
		BlazeLayout.render('mainLayout', { main: 'timetables' });
	}
});
FlowRouter.route('/timetable/:id', {
	name: 'singleTimetable',
	action(){
		BlazeLayout.render('mainLayout', { main: 'timetableDetail' });
	}
});
FlowRouter.route('/add-timetable', {
	name: 'addTimetable',
	action(){
		BlazeLayout.render('creationLayout', { main: 'addTimetable' });
	}
});
