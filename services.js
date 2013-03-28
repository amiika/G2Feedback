var app = angular.module('myApp', []);

app.service('TwitterService', function($http, $q) {
        this.search = function(id){
            console.log(id);
            var deferred = $q.defer();
              $http.jsonp('http://search.twitter.com/search.json?callback=JSON_CALLBACK',
              {params: {q: id}
            }).success(function(data, status) {
                deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    });
