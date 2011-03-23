/*
 *  Define routing.
 *
 *  Tried using the routes.js from http://maraksquires.com/routes.js but did not work well with params.
 *
 *  Usage:
 *
 *  route('/foo').bind( handler );
 *  route('/foo').bind( function() {} );
 *  route('/foo/:bar').bind( function(params) { params.bar } );
 *
 *  route.run('/foo/baz') // would call the handler with params.bar == 'baz'
 *
 */
window.routes = {}; // hold the routes
var route; // make a route var with global scope

// Make a scope for us to work in and not have to reference window.routes everytime.
(function(r) {

  route = function(str) {
    var obj;
    if (r[str]) {
      // get the existing route object
      obj = r[str];
    } else {
      // make a new route object
      // change :foo into ([^/]+)
      var reg = new RegExp(str.replace(/:([a-z-_]+)/gi,'([^/]+)'));
      r[str] = obj = {regex: reg, handlers: [], params: []};

      // setup the param names
      var matches = str.match(/:[a-z-_]+/gi);
      if (matches) {
        matches.forEach(function(name) {
          obj.params.push( name.replace(/:/,'') );
        });
      }

      // add the bind handler function
      obj.bind = function(handler) {
        obj.handlers.push(handler);
      };
    }

    return obj; // return the route object
  };

  route.run = function(str,args) {
    // test the str againts our routes
    var i;
    for (i in r) {
      var obj = r[i];
      var results = str.match(obj.regex);
      if (results) {
        var params = {};
        results.shift();

        // collect the parameters
        for (var i=0; i < obj.params.length; i++) {
          params[ obj.params[i] ] = results[i];
        }

        // call the handlers
        for (var i=0; i < obj.handlers.length; i++) {
          obj.handlers[i].call(null,params,args);
        }

        break;
      }
    }
  };

})(window.routes);

