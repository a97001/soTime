(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.v1')
    .controller('V1Controller', V1Controller);

  V1Controller.$inject = ['$scope', 'Global', 'V1'];

  function V1Controller($scope, Global, V1) {
    $scope.global = Global;
    $scope.package = {
      name: 'v1'
    };
  }
})();