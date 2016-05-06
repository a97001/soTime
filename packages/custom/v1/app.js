'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var V1 = new Module('v1');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
V1.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  V1.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  V1.menus.add({
    title: 'v1 example page',
    link: 'v1 example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  V1.aggregateAsset('css', 'v1.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    V1.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    V1.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    V1.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return V1;
});
