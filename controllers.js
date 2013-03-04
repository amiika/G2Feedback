
function MainControl($scope, $routeParams) {
  $scope.name = "MainControl";
  $scope.params = $routeParams;
}

function SchoolControl($scope, $routeParams) {

}

function AppControl($scope,SparqlService) {
    $scope.status = 'Querying';
    $scope.data = null;
    $scope.prop = null;
    $scope.getProperties = function(type) {
       SparqlService.query('SELECT ?p WHERE { ?s a <'+type+'> . ?s ?p ?o } GROUP BY ?p').then(function(data) {$scope.prop = data});
    }
        
    SparqlService.query('SELECT ?type WHERE { ?s a ?type} GROUP BY ?type').then(function(data)  {$scope.data = data});

}

function Tweet($scope,TwitterService){
 $scope.id = null;
 $scope.data = null;
 $scope.getTweets = function() {
     console.log("Trying service");
     TwitterService.search($scope.id).then(function(data) {
         $scope.data = data;
     });   
}
}