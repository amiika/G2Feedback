var prefix = "prefix teach:<http://linkedscience.org/teach/ns#> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix aiiso:<http://purl.org/vocab/aiiso/schema#> prefix ical: <http://www.w3.org/2002/12/cal/icaltzd#> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix fn:  <http://www.w3.org/2005/xpath-functions#>";

/* Control for main page */
function MainControl($scope, $routeParams) {
  $scope.name = "MainControl";
  $scope.params = $routeParams;
  
  //the search box redirection (wierd bug workaround)
  $scope.search = function() {
  	//console.log($scope.keywords);
  	window.location = "#/courses?keywords="+$scope.keywords;
  }
}

/* Control for Schools-page */
function SchoolControl($scope,SparqlService) {
    $scope.schools = null;
      SparqlService.query(prefix+"SELECT ?org ?name WHERE { ?d aiiso:part_of ?org . ?org foaf:name ?name . FILTER(lang(?name)='en') ?d aiiso:teaches ?c . ?c teach:arrangedAt ?l . } GROUP BY ?org ?name ORDER BY asc(?name)")
       .success(function(data, status) {$scope.schools = data});
}

/* Control for LectureList-page */
function LectureListControl($scope,$routeParams,$location,SparqlService) {
    $scope.params = $routeParams;
    $scope.lectures = null;
    $scope.status = "Loading lectures ...";   
    console.log($scope.params);
    
    SparqlService.query(prefix+"SELECT ?title ?l ?s ?e ?sum WHERE { ?d aiiso:part_of <"+$scope.params.id+"> . ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER(lang(?title)='en') ?c teach:arrangedAt ?l . ?l ical:dtstart ?s . ?l ical:dtend ?e . ?l ical:summary ?sum . BIND(xsd:int(substr(str(now()),12,2)) as ?now) BIND((xsd:int(substr(str(?s),12,2))) as ?snow) BIND(substr(str(now()),1,10) as ?today) BIND(substr(str(?s),1,10) as ?lday) FILTER(?today=?lday)} ORDER BY ?snow")
       .success(function(data, status) {
           
        if(data.results.bindings.length<1) {
            $scope.status="No lectures today";
        }
        else { 
            $scope.status="Select lecture";
            $scope.lectures = data;
        }
           
        });
}

/* Control for Tweet-page */
function LectureControl($scope,$routeParams,$location,TwitterService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    $scope.hash = encodeURIComponent($scope.params.id);

	//TODO: SPARQL that gets Lecture&course data? for more information about the lecture.

// Uses TwitterService to get tweets from twitter
 $scope.getTweets = function() {
     TwitterService.search($scope.params.id).then(function(data) {
         console.log(data);
         $scope.tweets = data;
     });   
    }

// Get tweets always when page and this controller is loaded.
  $scope.getTweets();

}

/* Control for course search results page */
function CourseListControl($scope,$routeParams,$location,SparqlService) {
    $scope.params = $routeParams;
    $scope.courses = null;
    $scope.status = "Loading search results ...";   
    console.log($scope.params);
    
    
    console.log("SELECT ?title ?l ?c ?d WHERE { ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER regex(?title ,'"+$scope.params.keywords+"','i') } ORDER BY ?c");
    //Finds the course by its name.
    //TODO: Find a course by its code.
    SparqlService.query(prefix+"SELECT ?title ?l ?c ?d WHERE { ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER regex(?title ,'"+$scope.params.keywords+"','i') } ORDER BY fn:lower-case(?title)")
       .success(function(data, status) {
           
        if(data.results.bindings.length<1) {
            $scope.status="No courses found.";
        }
        else { 
            $scope.status="Select course:";
            $scope.courses = data;
            console.log(data);
        }
        });
}

/* Control for the course general page with the Tweet-stuff */
function CourseControl($scope,$routeParams,$location,TwitterService,NoppaService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    

	// Uses TwitterService to get tweets from twitter
 	//filter punctuation out of it.
 	console.log($scope.params.id);
    var temp = $scope.params.id;
    temp = temp.replace(".","");
    temp = temp.replace("-","");
    $scope.hash = encodeURIComponent("Aalto"+temp);
 	$scope.getTweets = function() {
     	console.log($scope.hash);
     	TwitterService.search($scope.hash).then(function(data) {
         	console.log(data);
         	$scope.tweets = data;
     	});   
    }

	// Get tweets always when page and this controller is loaded.
  	$scope.getTweets();
  
  
  	//call noppa for information
  	$scope.noppa = null;
  	$scope.noppaExtra = null;
  	$scope.noppaNews = null;
  	NoppaService.searchCourse($scope.params.id).then(function(data) {
         	console.log(data);
         	$scope.noppa = data;
    }); 
    NoppaService.searchCourseOverview($scope.params.id).then(function(data) {
         	console.log(data);
         	$scope.noppaExtra = data;
    });
    NoppaService.searchCourseNews($scope.params.id).then(function(data) {
         	console.log(data);
         	$scope.noppaNews = data;
    });  
}

// This is old test. SHOULD BE REMOVED?
function Tweet($scope,TwitterService){
 $scope.id = null;
 $scope.data = null;
 $scope.getTweets = function() {
     TwitterService.search($scope.id).then(function(data) {
         $scope.data = data;
     });   
}
}
