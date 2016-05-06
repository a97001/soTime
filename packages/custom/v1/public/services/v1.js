(function () {
  'use strict';

  angular
    .module('mean.v1')
    .factory('V1', V1);

  V1.$inject = [];

  function V1() {
    return {
      name: 'v1'
    };
  }
})();
