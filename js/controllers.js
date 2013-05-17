var prefix = "prefix teach:<http://linkedscience.org/teach/ns#> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix aiiso:<http://purl.org/vocab/aiiso/schema#> prefix ical: <http://www.w3.org/2002/12/cal/icaltzd#> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix fn:  <http://www.w3.org/2005/xpath-functions#>";

/* Control for main page.*/
function MainControl($scope, $routeParams, localStorageService) {
  $scope.name = "MainControl";
  $scope.params = $routeParams; 
  //the search box redirection (weird bug workaround)
  $scope.search = function() {
  	window.location = "#/courses?keywords="+$scope.keywords;
  }
  
  // Count how many courses are in favorite list. Had to do this in a primitive way in order to make it work in IE too.
  $scope.favSize=0;
  var favCourses = localStorageService.getAll();
  for(k in favCourses){
  	$scope.favSize++;
  }
  
}

/* Control for Schools-page */
function SchoolControl($scope,SparqlService) {
    $scope.schools = null;
    // SPARQL-query for finding the schools that arrange courses
    SparqlService.query(prefix+"SELECT ?org ?name WHERE { ?d aiiso:part_of ?org . ?org foaf:name ?name . FILTER(lang(?name)='en') ?d aiiso:teaches ?c . ?c teach:arrangedAt ?l . } GROUP BY ?org ?name ORDER BY asc(?name)")
       .success(function(data, status) {$scope.schools = data});
}

/* Control for LectureList-page */
function LectureListControl($scope,$routeParams,$location,SparqlService) {
    $scope.params = $routeParams;
    $scope.lectures = null;
    $scope.status = "Loading lectures ...";
    
    // SPARQL-query for finding today's lectures
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

/* Control for Lecture-page */
function LectureControl($scope,$routeParams,$location,TwitterService, NoppaService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    var temp = $scope.params.id; // get course code from the parameters 
    temp = temp.replace(".",""); // replace '.' and'-. with '' because of limitations in the Twitter API
    temp = temp.replace("-","");
    $scope.hash = encodeURIComponent($scope.params.lecture_id) + ", " + encodeURIComponent("Aalto"+temp); // hashtags for the lecture

// Uses TwitterService to get tweets from twitter
 $scope.getTweets = function() {
     TwitterService.search($scope.params.lecture_id).then(function(data) {
         $scope.tweets = data;
     });   
    }

// Get tweets always when page and this controller is loaded.
  $scope.getTweets();

	//call noppa for more information
	$scope.noppa = null;
	$scope.noppaExtra = null;
	$scope.noppaNews = null;
	$scope.noppaLectureInfo = null;
    // due to limitations in the NOPPA API we will have to do 4 different queries in order to get all the relevant information
	NoppaService.searchCourse($scope.params.id).then(function(data) {
	 	$scope.noppa = data;
	}); 
	NoppaService.searchCourseOverview($scope.params.id).then(function(data) {
	 	$scope.noppaExtra = data;
	});
	NoppaService.searchCourseNews($scope.params.id).then(function(data) {
	 	$scope.noppaNews = data;
	});
	NoppaService.searchLectureInfo($scope.params.id).then(function(results) {
		for (lecture in results.data) {

			if ("A"+results.data[lecture].lecture_id+"L" == $scope.params.lecture_id) {		
				$scope.noppaLectureInfo = results.data[lecture];
			}
		}
	});
}

/* Control for course search results page */
function CourseListControl($scope,$routeParams,$location,SparqlService,localStorageService) {
    $scope.params = $routeParams;
    $scope.courses = null;
    $scope.status = "Loading search results ...";   
  
    //Finds the course by its name or course code.
    SparqlService.query(prefix+"SELECT ?title ?l ?c ?d ?code WHERE {{ ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . ?c aiiso:code ?code . FILTER regex(?title ,'"+$scope.params.keywords+"','i') } UNION { ?d aiiso:teaches ?c . ?c teach:courseTitle ?title . ?c aiiso:code ?code . FILTER regex(str(?code) ,'"+$scope.params.keywords+"','i') }} ORDER BY fn:lower-case(?title)")
       .success(function(data, status) {
           
        if(data.results.bindings.length<1) {
            $scope.status="No courses found.";
        }
        else { 
            $scope.status="Select course:";
            $scope.courses = data;
        }
        }).error(function(data, status) {
	   $scope.status="Oops! Something went wrong!";
	});
    
    // adds course to favorites
    $scope.addFavorite = function(object){
		localStorageService.add(object.c.value,JSON.stringify(object));
	}
    // determines whether course is already in favorites
	$scope.isFavorite = function(object){
		var value = localStorageService.get(object.c.value);
		if (value != null ) {
			return true;
		}
		return false;
	}
    // removes course from favorites
	$scope.removeFavorite = function(object){
	   	localStorageService.remove(object.c.value);	
	}
}

/* Control for the course general page with the Tweet-stuff */
function CourseControl($scope,$routeParams,$location,TwitterService,NoppaService,localStorageService) {
    $scope.params = $routeParams;
    $scope.tweets = null;
    $scope.status = "Loading tweets ...";
    
	// Uses TwitterService to get tweets from twitter
 	//filter punctuation out of it.
    var temp = $scope.params.id;
    temp = temp.replace(".","");
    temp = temp.replace("-","");
    $scope.hash = encodeURIComponent("Aalto"+temp); // course hashtag
    
 	$scope.getTweets = function() {
     	TwitterService.search($scope.hash).then(function(data) {
         	$scope.tweets = data;
     	});   
    }

	// Get tweets always when page and this controller is loaded.
  	$scope.getTweets();
  
  
  	//call noppa for information
  	$scope.noppa = null;
  	$scope.noppaExtra = null;
  	$scope.noppaNews = null;
  	var haxObject = {};  //haxes (later there is an explanation)
	var tempObject1 = {}; var tempObject2 = {}; //temps for the hax
	tempObject1["value"] = "http://data.aalto.fi/id/courses/noppa/course_"+$scope.params.id; //hax for the course code that is the same format as from data.aalto.fi
	haxObject["c"] = tempObject1;
  	NoppaService.searchCourse($scope.params.id).then(function(data) {
         	$scope.noppa = data;
         	tempObject2["value"] = $scope.noppa.data.name;	//name of the course for saving it in the favorites
			haxObject["title"] = tempObject2;
    }); 
    NoppaService.searchCourseOverview($scope.params.id).then(function(data) {
         	$scope.noppaExtra = data;
    });
    NoppaService.searchCourseNews($scope.params.id).then(function(data) {
         	$scope.noppaNews = data;
    });  
    
    //favorites
    $scope.addFavorite = function(object){
		localStorageService.add(object.c.value,JSON.stringify(object));
	}
	$scope.isFavorite = function(object){
		var value = localStorageService.get(object.c.value);
		if (value != null ) {
			return true;
		}
		return false;
	}
	$scope.removeFavorite = function(object){
	   	localStorageService.remove(object.c.value);	
	}
	
	/*
	 * So we have to determine if the course is in the favorites or not.
	 * Basically, the function to store in the local storage uses the response from sparql to store a course object.
	 * The unique identifier of the course is the data.aalto.fi identifier for the course.
	 * Now, I dont wanna call the sparql in the course page just so that we can pull a whole object to maybe put in our favorites and do nothing with it...
	 * So, I kind of hax it, by creating the url identifier (this isn't that serious, because in the case the identifier changes in data.aalto.fi, 
	 * then either way it wouldn't be able to recognize the old identifier of the course) and creating a similar object with just the needed data, pulled from the noppa api calls we make anyways.
	 * Now with this object, we can do the same isFavorite call in the template to determine if it is in our favorites.
	 */
	
	$scope.objectHax = haxObject;
}

/* Control for favorites-page */
function ShowFavoritesControl($scope,localStorageService){
	$scope.status = "No favorite courses";
    // removing course from favorites
	$scope.removeFavorite = function(id){
	   	localStorageService.remove(id);
		$scope.getFavorites();
		for (fav in $scope.favorites) {
			return;
		}
		$scope.status = "No favorite courses"; // if no favorite courses, change status text
		
	}
    // function for getting the favorites from the localstorage
	$scope.getFavorites = function(){
		$scope.favorites = localStorageService.getAll();
		for (fav in $scope.favorites) {
			$scope.favorites[fav] = JSON.parse($scope.favorites[fav]);
			$scope.status = "";
		}
		
	}
}
