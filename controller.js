(function($) { // make sure jQuery is available as $

  Fr.Controller = Fr.Controller || {}; // make sure the Controller namespace is available

  var controllers = {};

  Fr.Controller.create = function(name,controller) {
    controllers[name] = controller;
  };

  Fr.Controller.init = function() {
    $.each(controllers,function(name,controller) {
      if (Fr.views[name]) {
        Fr.views[name].data('controller',$.extend({
          // create the default controller methods
          beforeFilter: function() {},
          html: function() {},
          afterRender: function() {}
        }, controller.apply(Fr.views[name]) ));
      }
    });
  };

})(jQuery);
