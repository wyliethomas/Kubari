(function($) {
  $.extend(Fr.plugin.methods,{
    init: function(app_name,app_root) {
      Fr[app_name] = this; // keep the context of the framework
      this.data('AppRoot',app_root);
      this.data('AppName',app_name);

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
  //$(function() { $(document).framework('init','app_name','app_root'); }); // example init call
})(jQuery);
