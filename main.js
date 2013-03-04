// Angularjs SparqlService testing

var app = angular.module('myApp', [], function($routeProvider, $locationProvider) {

$routeProvider.when('/main', {
    templateUrl: 'tpl/main.html',
    controller: 'MainControl'
});

$routeProvider.when('/school', {
    templateUrl: 'tpl/school.html',
    controller: 'SchoolControl'
});
  
$routeProvider.otherwise({redirectTo:'/main'});

  // configure html5 to get links working on cloudide
 // $locationProvider.html5Mode(true);

});

app.config(['$httpProvider', function($httpProvider) {
    delete $httpProvider.defaults.headers.common["X-Requested-With"]
}]);