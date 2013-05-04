!(function() {

// FILTERS
var filters = angular.module('filters', []);
    
filters.filter('urlFilter', function () {
    return function (url, after) {
         return url.substr(url.lastIndexOf(after)+1);
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
              return $http.jsonp('http://search.twitter.com/search.json?callback=JSON_CALLBACK',
              {params: {q: id}
            })}
    }
    return twitterService;
}); 

}).call(this);