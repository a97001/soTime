(function () {
  'use strict';

  angular
    .module('mean.v1')
    .config(v1);

  v1.$inject = ['$stateProvider'];

  function v1($stateProvider) {
    $stateProvider.state('v1 example page', {
      url: '/v1/example',
      templateUrl: 'v1/views/index.html'
    });
  }

})();
