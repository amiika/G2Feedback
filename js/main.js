// Angularjs SparqlService testing

// Main constructor. Place to include modules and routes.
var app = angular.module('myApp', ['filters','services'], function($routeProvider, $locationProvider) {

$routeProvider.when('/main', {
    templateUrl: 'tpl/main.html',
    controller: 'MainControl'
});

$routeProvider.when('/schools', {
    templateUrl: 'tpl/schools.html',
    controller: 'SchoolControl'
});

$routeProvider.when('/lectures', {
    templateUrl: 'tpl/lectures.html',
    controller: 'LectureListControl'
});

$routeProvider.when('/lecture', {
    templateUrl: 'tpl/lecture.html',
    controller: 'LectureControl'
});
  
$routeProvider.otherwise({redirectTo:'/main'});

});

// CORS fix
app.config(['$httpProvider', function($httpProvider) {
    delete $httpProvider.defaults.headers.common["X-Requested-With"]
}]);

