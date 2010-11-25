(function($) { // make sure jQuery is available as $

  Fr.Controller = Fr.Controller || {}; // make sure the Controller namespace is available

  var controllers = {};

  Fr.Controller.create = function(name,controller) {
    controllers[name] = controller;
  };

  Fr.Controller.init = function() {
    $.each(controllers,function(name,controller) {
      Fr.views(name,function(view) {
        view.data('controller',$.extend({
          // create the default controller methods
          beforeFilter: function() {},
          render: function() {},
          afterRender: function() {}
        }, controller.apply( view ) ));
      });
    });
  };

})(jQuery);
