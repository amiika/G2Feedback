!(function() {

// FILTERS
var filters = angular.module('filters', []);
   
//filtering the twitter hashtag
filters.filter('urlFilter', function () {
    return function (url, after) {
         //get the last part (lecture number or course code)
         var temp = url.substr(url.lastIndexOf(after)+1)
         //filter punctuation out of it.
         temp = temp.replace(".","");
         return temp.replace("-","");
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
    var twitterService = {
        search: function(id){
              return $http.jsonp('http://search.twitter.com/search.json?callback=JSON_CALLBACK',  //include_entities=true could be used if needed
              {params: {q: "#"+id}
            })}
    }
    return twitterService;
}); 

}).call(this);