!(function() {

// FILTERS
var filters = angular.module('filters', []);
   
filters.filter('urlFilter', function () {
    return function (url, after) {
         //get the last part (lecture number or course code)
         return url.substr(url.lastIndexOf(after)+1);
    };
});
filters.filter('twitterDateFilter', function () {
    return function (date, after) {
         //get the last part (lecture number or course code)
         return date.substr(0,date.lastIndexOf(after));
    };
});

// SERVICES
var services = angular.module('services', []);

// SPARQL-Service
services.factory('SparqlService', function($http) {    
    var sparqlService = {
        query: function(query){
              return $http({
                method: 'GET',
                headers: { 'Accept' : 'application/sparql-results+json' },
                url: 'http://data.aalto.fi/sparql',
                params: {query: query}
            })}
    }
    return sparqlService;
});

// TWITTER-Service
services.factory('TwitterService', function($http) {    
    console.log("Going into TwitterService");
    var twitterService = {
        search: function(id){
              return $http.jsonp('http://search.twitter.com/search.json?callback=JSON_CALLBACK',  //include_entities=true could be used if needed
              {params: {q: "#"+id}
            })}
    }
    return twitterService;
}); 

// Noppa-service
services.factory('NoppaService', function($http) {    
    console.log("Going into NoppaService");
    var noppaService = {
        searchCourse: function(id){
              return $http.jsonp('http://noppa-api-dev.aalto.fi/api/v1/courses/'+id+'?key=cdda4ae4833c0114005de5b5c4371bb8&callback=JSON_CALLBACK')
              },
        searchCourseOverview: function(id){
           	  return $http.jsonp('http://noppa-api-dev.aalto.fi/api/v1/courses/'+id+'/overview?key=cdda4ae4833c0114005de5b5c4371bb8&callback=JSON_CALLBACK')
           	  },
        searchCourseNews: function(id){
           	  return $http.jsonp('http://noppa-api-dev.aalto.fi/api/v1/courses/'+id+'/news?key=cdda4ae4833c0114005de5b5c4371bb8&callback=JSON_CALLBACK')
           	  },searchLectureInfo: function(id){
              return $http.jsonp('http://noppa-api-dev.aalto.fi/api/v1/courses/'+id+'/lectures?key=cdda4ae4833c0114005de5b5c4371bb8&callback=JSON_CALLBACK')
              }
    };
    
    return noppaService;
}); 

}).call(this);
