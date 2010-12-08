(function($) { // make sure jQuery is available as $
  var all_controllers = {};

  Fr.Controller = {
    create: function(app_name,controller_name,controller) {
      var list = all_controllers[app_name] = all_controllers[app_name] || {};
      list[controller_name] = controller;
    }
  };

  $.extend(Fr.plugin.methods,{
    _loadControllers_: function(app_name) {
      var self = this;
      $.each(all_controllers[app_name],function(name,controller) {
        self.framework('views',name,function(view) {
          view.data('controller',$.extend({
            // create the default controller methods
            beforeFilter: $.noop,
            render: function(done) {done()},
            afterRender: $.noop,
            cleanUp: $.noop
          }, controller.apply( view ) ));
        });
      });
    }
  });
})(jQuery);
