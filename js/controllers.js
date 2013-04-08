var prefix = "prefix teach:<http://linkedscience.org/teach/ns#> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix aiiso:<http://purl.org/vocab/aiiso/schema#> prefix ical: <http://www.w3.org/2002/12/cal/icaltzd#> prefix xsd: <http://www.w3.org/2001/XMLSchema#>";

function MainControl($scope, $routeParams) {
  $scope.name = "MainControl";
  $scope.params = $routeParams;
}

function SchoolControl($scope,SparqlService) {
    $scope.schools = null;
      SparqlService.query(prefix+"SELECT ?org ?name WHERE { ?d aiiso:part_of ?org . ?org foaf:name ?name . FILTER(lang(?name)='en') ?d aiiso:teaches ?c . ?c teach:arrangedAt ?l . } GROUP BY ?org ?name ORDER BY desc(?name)")
       .success(function(data, status) {$scope.schools = data});
}

function LectureListControl($scope,$routeParams,$location,SparqlService) {
    $scope.params = $routeParams;
    $scope.lectures = null;
    $scope.status = "Loading lectures ...";   
    console.log($scope.params);
    
    SparqlService.query(prefix+"SELECT ?title ?l ?s ?e ?sum WHERE { ?d aiiso:part_of <"+$scope.params.id+"> . ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER(lang(?title)='en') ?c teach:arrangedAt ?l . ?l ical:dtstart ?s . ?l ical:dtend ?e . ?l ical:summary ?sum . BIND(xsd:int(substr(str(now()),12,2)) as ?now) BIND((xsd:int(substr(str(?e),12,2))) as ?enow) BIND(substr(str(now()),1,10) as ?today) BIND(substr(str(?s),1,10) as ?lday) FILTER(?today=?lday)} ORDER BY ?enow")
       .success(function(data, status) {
           
        if(data.results.bindings.length<1) {
            $scope.status="No lectures today";
        }
        else { 
            $scope.status="Select lecture";
            $scope.lectures = data
        }
           
        });
}

function LectureControl($scope,$routeParams,$location,TwitterService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    $scope.hash = encodeURIComponent($scope.params.id);
    
 $scope.getTweets = function() {
     TwitterService.search($scope.params.id).then(function(data) {
         console.log(data);
         $scope.tweets = data;
     });   
    }
    
  $scope.getTweets();

}

function Tweet($scope,TwitterService){
 $scope.id = null;
 $scope.data = null;
 $scope.getTweets = function() {
     TwitterService.search($scope.id).then(function(data) {
         $scope.data = data;
     });   
}
}
