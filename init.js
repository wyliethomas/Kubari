(function($) {
  $(function() {

    $.extend(Fr.plugin.methods,{
      init: function(app_name) {
        Fr[app_name] = this; // keep the context of the framework

        // load the views into the framework
        $("#_framework-views",this).framework("_loadViews_");

        // initialize the controllers
        Fr.Controller.init();

        // render the entry point view
        Fr.views("layouts/application",function(view) {
          view.framework('renderAsLayout');
        });
      }
    });

    //$(document).framework(); // call init

  });
})(jQuery);
