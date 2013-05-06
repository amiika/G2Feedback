var prefix = "prefix teach:<http://linkedscience.org/teach/ns#> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix aiiso:<http://purl.org/vocab/aiiso/schema#> prefix ical: <http://www.w3.org/2002/12/cal/icaltzd#> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix fn:  <http://www.w3.org/2005/xpath-functions#>";

/* Control for main page */
//Tam:lisasin localStorageService parametriksi
function MainControl($scope, $routeParams, localStorageService) {
  $scope.name = "MainControl";
  $scope.params = $routeParams; 
  //the search box redirection (wierd bug workaround)
  $scope.search = function() {
  	//console.log($scope.keywords);
  	window.location = "#/courses?keywords="+$scope.keywords;
  }
  
  //Tamin lisays, starts
  $scope.favSize = Object.keys(localStorageService.getAll()).length; //suosikkien lukumaara
  //Tamin lisays, ends
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
    
    SparqlService.query(prefix+"SELECT ?title ?c ?l ?s ?e ?sum WHERE { ?d aiiso:part_of <"+$scope.params.id+"> . ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER(lang(?title)='en') ?c teach:arrangedAt ?l . ?l ical:dtstart ?s . ?l ical:dtend ?e . ?l ical:summary ?sum . BIND(xsd:int(substr(str(now()),12,2)) as ?now) BIND((xsd:int(substr(str(?s),12,2))) as ?snow) BIND(substr(str(now()),1,10) as ?today) BIND(substr(str(?s),1,10) as ?lday) FILTER(?today=?lday)} ORDER BY ?snow")
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
function LectureControl($scope,$routeParams,$location,TwitterService, NoppaService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    var temp = $scope.params.id;
    temp = temp.replace(".","");
    temp = temp.replace("-","");
    $scope.hash = encodeURIComponent($scope.params.lecture_id) + ", " + encodeURIComponent("Aalto"+temp);

	//TODO: SPARQL that gets Lecture&course data? for more information about the lecture.

// Uses TwitterService to get tweets from twitter
 $scope.getTweets = function() {
     TwitterService.search($scope.params.lecture_id).then(function(data) {
         console.log(data);
         $scope.tweets = data;
     });   
    }

// Get tweets always when page and this controller is loaded.
  $scope.getTweets();

	// I just copied below snippet from CourseControl
	//call noppa for information
	$scope.noppa = null;
	$scope.noppaExtra = null;
	$scope.noppaNews = null;
	$scope.noppaLectureInfo = null;
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
	NoppaService.searchLectureInfo($scope.params.id).then(function(results) {
	 	console.log(results);
		for (lecture in results.data) {

			if ("A"+results.data[lecture].lecture_id+"L" == $scope.params.lecture_id) {		
				$scope.noppaLectureInfo = results.data[lecture];
			}
		}
	});
 	

}

/* Control for course search results page */
//Tam: lisasin angularLocalStorage parametrina
function CourseListControl($scope,$routeParams,$location,SparqlService,localStorageService) {
    $scope.params = $routeParams;
    $scope.courses = null;
    $scope.status = "Loading search results ...";   
    //console.log($scope.params);
    
    
    //Finds the course by its name.
    //TODO: Find a course by its code.
    SparqlService.query(prefix+"SELECT ?title ?l ?c ?d ?code WHERE {{ ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . ?c aiiso:code ?code . FILTER regex(?title ,'"+$scope.params.keywords+"','i') } UNION { ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . ?c aiiso:code ?code . FILTER regex(str(?code) ,'"+$scope.params.keywords+"','i') }} ORDER BY fn:lower-case(?title)")
       .success(function(data, status) {
           
        if(data.results.bindings.length<1) {
            $scope.status="No courses found."; //  UNION { ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . FILTER regex(str(?c) ,'"+$scope.params.keywords+"','i') }
        }
        else { 
            $scope.status="Select course:";
            $scope.courses = data;
            //console.log(data);
        }
        }).error(function(data, status) {
	   $scope.status="Oops! Something went wrong!";
	});
        
    /*Tamin lisays,starts*/
    $scope.addFavorite = function(object){
		localStorageService.add(object.c.value,JSON.stringify(object));
	}
	$scope.isFavorite = function(object){
		var value = localStorageService.get(object.c.value);
		if (value != null ) {
			//console.log(value);
			return true;
		}
		return false;
	}
	$scope.removeFavorite = function(object){
	   	localStorageService.remove(object.c.value);
		//$scope.isFavorite(object);	
	}
	
	/*Tamin lisays, ends*/
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

/*Tamin lisays, starts*/
function ShowFavoritesControl($scope,localStorageService){
	$scope.status = "No favorite courses";
	$scope.removeFavorite = function(id){
	   	localStorageService.remove(id);
		$scope.getFavorites();
		for (fav in $scope.favorites) {
			return;
		}
		$scope.status = "No favorite courses";
		
	}
	$scope.getFavorites = function(){
		console.log("testing storgge");		
		console.log(localStorageService.getAll());
		$scope.favorites = localStorageService.getAll();
		//console.log("Tam tutkii");
		//console.log(Object.keys($scope.favorites).length);
		//console.log("Tam tutkii");
		for (fav in $scope.favorites) {
			$scope.favorites[fav] = JSON.parse($scope.favorites[fav]);
			$scope.status = "";
		}
		
	}
}
/*Tamin lisays, ends*/

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
