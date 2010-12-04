(function($) {
  $(function() {

    $.extend(Fr.plugin.methods,{
      init: function(app_name) {
        Fr[app_name] = this; // keep the context of the framework

        // load the views into the framework
        this.data('_views',{});
        this.framework("_loadViews_");

        // initialize the controllers
        this.framework('_loadControllers_',app_name);

        // render the entry point view
        this.framework('views',"layouts/application",function(view) {
          Fr[app_name].framework('renderAsLayout',view);
        });
      }
    });

    //$(document).framework(); // call init

  });
})(jQuery);
